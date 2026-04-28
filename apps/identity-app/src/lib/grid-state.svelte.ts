import { fetchFullIdentity, subscribeToIdentity, mapEventToAction } from '@goy/nostr';

// Global Singleton State using Svelte 5 Runes
// This instance will persist across Astro View Transitions
class GridState {
  profile = $state({
    name: '',
    nip05: '',
    bio: '',
    pubkey: '',
    avatar: '',
    banner: '',
    following: 0,
    followers: 0
  });

  relays = $state([
    { name: 'PRIMAL-RELAY', status: 'ONLINE', latency: 0 },
    { name: 'ZURICH-01', status: 'ONLINE', latency: 0 },
    { name: 'LONDON-04', status: 'ONLINE', latency: 0 }
  ]);

  logs = $state<{ id: string; time: string; action: string; status: string }[]>([]);
  
  isLoading = $state(true);
  isInitialized = $state(false);
  private unsubscribe: (() => void) | null = null;

  addLog(action: string, status: string = 'OK') {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const id = Math.random().toString(36).slice(2, 9);
    this.logs = [{ id, time, action, status }, ...this.logs].slice(0, 15);
  }

  async sync(pubkey: string, force = false) {
    // CRITICAL: If we are already initialized in memory, DO NOT set isLoading to true
    // This is what prevents the flicker between routes
    if (this.isInitialized && !force) {
      // Just refresh in background if pubkey matches, otherwise reset
      if (this.profile.pubkey !== pubkey) {
        this.reset(pubkey);
        await this.refreshData(pubkey);
      } else {
        this.refreshData(pubkey); // Silent background refresh
      }
      return;
    }

    this.isLoading = true;
    this.profile.pubkey = pubkey;
    
    await this.refreshData(pubkey);
    
    this.isLoading = false;
    this.isInitialized = true;
    
    this.startLiveLink(pubkey);
  }

  private async startLiveLink(pubkey: string) {
    if (this.unsubscribe) return;
    
    this.unsubscribe = await subscribeToIdentity(pubkey, (update) => {
      if (update.type === 'activity') {
        this.addLog(mapEventToAction(update.content));
      }
      if (update.type === 'metadata') {
        this.updateProfile(update.content, null, null);
        this.notifyWorker(pubkey, update.rawEvent);
      }
      if (update.type === 'following') {
        this.profile.following = update.content;
      }
    });
  }

  private async notifyWorker(pubkey: string, event: any) {
    try {
      const host = window.location.hostname === 'localhost' ? 'http://localhost:8787' : 'https://api-worker.goycompany.workers.dev';
      await fetch(`${host}/profile/${pubkey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (e) { /* silent */ }
  }

  private async refreshData(pubkey: string) {
    try {
      const data: any = await fetchFullIdentity(pubkey);
      this.updateProfile(data.metadata, data.following, data.followers);
      
      if (data.network?.relays) {
        this.relays = Object.entries(data.network.relays).map(([url, info]: [string, any]) => ({
          name: url.replace('wss://', '').toUpperCase(),
          status: info.status,
          latency: info.latency
        }));
      }
    } catch (e) {
      console.error('Grid Sync Error:', e);
    }
  }

  private updateProfile(metadata: any, following: number | null, followers: number | null) {
    if (metadata) {
      this.profile.name = metadata.display_name || metadata.name || `Entity_${this.profile.pubkey.slice(0, 8)}`;
      this.profile.nip05 = metadata.nip05 || '';
      this.profile.bio = metadata.about || '';
      this.profile.avatar = metadata.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${this.profile.pubkey}`;
      this.profile.banner = metadata.banner || '';
    }
    if (following !== null) this.profile.following = following;
    if (followers !== null) this.profile.followers = followers;
  }

  private reset(pubkey: string) {
    this.isInitialized = false;
    this.cleanup();
    this.profile.pubkey = pubkey;
    this.profile.name = '';
    this.profile.avatar = '';
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

// The instance 'grid' stays alive between page navigations thanks to View Transitions
export const grid = new GridState();
