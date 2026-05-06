import { fetchFullIdentity, subscribeToIdentity, mapEventToAction, signEventWithSecret } from '@goy/nostr';

// Global Singleton State using Svelte 5 Runes
// This instance will persist across Astro View Transitions
class GridState {
  profile = $state({
    name: '',
    display_name: '',
    nip05: '',
    bio: '',
    pubkey: '',
    avatar: '',
    banner: '',
    website: '',
    lud16: ''
  });

  relays = $state([
    { name: 'PRIMAL-RELAY', status: 'ONLINE', latency: 0 },
    { name: 'ZURICH-01', status: 'ONLINE', latency: 0 },
    { name: 'LONDON-04', status: 'ONLINE', latency: 0 }
  ]);

  logs = $state<{ id: string; time: string; action: string; status: string; raw?: any }[]>([]);
  
  isLoading = $state(true);
  isInitialized = $state(false);
  sessionType = $state<'TRADITIONAL' | 'SOVEREIGN'>('SOVEREIGN');
  private unsubscribe: (() => void) | null = null;

  async saveNodes() {
    // Logic for nodes placeholder
  }

  async updateMetadata(newMetadata: any) {
    if (!this.profile.pubkey) return;

    try {
      this.addLog('IDENTITY_SYNC_INITIATED', 'PENDING');

      if (this.sessionType === 'SOVEREIGN') {
        // Path A: Sovereign
        let event;
        if (typeof window !== 'undefined' && (window as any).nostr) {
          // A1: Via Extension (NIP-07)
          event = await (window as any).nostr.signEvent({
            kind: 0,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: JSON.stringify(newMetadata)
          });
        } else {
          // A2: Via Stored Secret (In-memory/session)
          const storedPrivkey = typeof window !== 'undefined' ? sessionStorage.getItem('goy_privkey') : null;
          if (!storedPrivkey) throw new Error('NOSTR_EXTENSION_MISSING');
          
          const eventTemplate = {
            kind: 0,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: JSON.stringify(newMetadata)
          };
          event = signEventWithSecret(eventTemplate, storedPrivkey);
        }
        
        await this.notifyWorker(this.profile.pubkey, event);
      } else {
        // Path B: Traditional (Server-side signing via Managed NSEC)
        const res: any = await this.notifyWorker(this.profile.pubkey, newMetadata);
        // If the server provisioned or returned a real pubkey, update it
        if (res?.pubkey && res.pubkey !== this.profile.pubkey) {
           this.profile.pubkey = res.pubkey;
           if (typeof window !== 'undefined') sessionStorage.setItem('goy_pubkey', res.pubkey);
        }
      }

      // 3. Update locally immediately
      this.updateProfile(newMetadata);
      
      this.addLog('IDENTITY_SYNC_SUCCESSFUL');
      return { success: true };
    } catch (e) {
      console.error('Failed to update metadata:', e);
      this.addLog('IDENTITY_SYNC_FAILURE', 'ERROR');
      throw e;
    }
  }

  addLog(action: string, status: string = 'OK', raw?: any) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const id = Math.random().toString(36).slice(2, 9);
    this.logs = [{ id, time, action, status, raw }, ...this.logs].slice(0, 15);
  }

  async sync(pubkey: string, force = false) {
    if (this.isInitialized && !force) {
      if (this.profile.pubkey !== pubkey) {
        this.reset(pubkey);
        await this.refreshData(pubkey);
      } else {
        this.refreshData(pubkey);
      }
      return;
    }

    this.isLoading = true;
    this.profile.pubkey = pubkey;
    
    if (typeof window !== 'undefined') {
      this.sessionType = (sessionStorage.getItem('goy_session_type') as any) || 'SOVEREIGN';
    }
    
    await this.refreshData(pubkey);
    
    this.isLoading = false;
    this.isInitialized = true;
    
    this.startLiveLink(pubkey);
  }

  private async startLiveLink(pubkey: string) {
    if (this.unsubscribe) {
       this.unsubscribe();
       this.unsubscribe = null;
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.finalSyncOnClose();
      });
    }
    
    try {
      if (typeof window === 'undefined') return;
      const host = window.location.hostname === 'localhost' ? 'localhost:8787' : 'api-worker.goycompany.workers.dev';
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const socket = new WebSocket(`${protocol}://${host}/uplink/${pubkey}`);

      socket.onmessage = (event) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        const update = JSON.parse(event.data);
        if (update.type === 'activity') {
          this.addLog(mapEventToAction(update.content), 'OK', update.content);
        }
        if (update.type === 'metadata') {
          this.updateProfile(update.content);
        }
        if (update.type === 'network_update') {
          this.relays = Object.entries(update.relays).map(([url, info]: [string, any]) => ({
            name: url.replace('wss://', '').toUpperCase(),
            status: info.status,
            latency: info.latency
          }));
        }
      };

      this.unsubscribe = () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      };
    } catch (e) {
      console.warn('Grid Uplink failed');
    }
  }

  private async finalSyncOnClose() {
    if (!this.profile.pubkey || typeof window === 'undefined') return;
    if (this.sessionType !== 'SOVEREIGN' || !(window as any).nostr) return;

    try {
      const host = window.location.hostname === 'localhost' ? 'http://localhost:8787' : 'https://api-worker.goycompany.workers.dev';
      const url = `${host}/profile/${this.profile.pubkey}`;
      const event = await (window as any).nostr.signEvent({
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['u', url]],
        content: 'Final Sync Trigger'
      });
      fetch(url, { method: 'POST', body: JSON.stringify(event), keepalive: true });
    } catch (e) {}
  }

  private async notifyWorker(pubkey: string, payload: any) {
    if (typeof window === 'undefined') return;
    try {
      const host = window.location.hostname === 'localhost' ? 'http://localhost:8787' : 'https://api-worker.goycompany.workers.dev';
      const res = await fetch(`${host}/profile/${pubkey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (res.ok) return await res.json();
    } catch (e) {}
  }

  private async refreshData(pubkey: string) {
    try {
      const data: any = await fetchFullIdentity(pubkey);
      this.updateProfile(data.metadata);

      if (data.metadata?.pubkey && data.metadata.pubkey !== pubkey) {
        this.profile.pubkey = data.metadata.pubkey;
        if (typeof window !== 'undefined') sessionStorage.setItem('goy_pubkey', data.metadata.pubkey);
      }
      
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

  private updateProfile(metadata: any) {
    if (metadata) {
      this.profile.display_name = metadata.display_name || metadata.name || `ENTITY_${this.profile.pubkey.slice(0, 8)}`;
      this.profile.name = metadata.name || metadata.display_name || `entity_${this.profile.pubkey.slice(0, 8)}`;
      this.profile.nip05 = metadata.nip05 || '';
      this.profile.bio = metadata.about || '';
      this.profile.avatar = metadata.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${this.profile.pubkey}`;
      this.profile.banner = metadata.banner || '';
      this.profile.website = metadata.website || '';
      this.profile.lud16 = metadata.lud16 || '';
      if (metadata.pubkey) this.profile.pubkey = metadata.pubkey;
    }
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

export const grid = new GridState();
