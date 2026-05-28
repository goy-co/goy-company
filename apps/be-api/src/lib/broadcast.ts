import { Relay } from 'nostr-tools/relay';
import { DEFAULT_RELAYS } from './constants';

/**
 * Robustly publishes an event to multiple relays with timeouts and detailed logging.
 */
export async function broadcastToGrid(event: any): Promise<void> {
  console.log(`[GRID_BROADCAST] START: Broadcasting event ${event.id?.slice(0,8)} (Kind ${event.kind})`);
  
  const promises = DEFAULT_RELAYS.map(async (url) => {
    let relay: any = null;
    const start = Date.now();
    
    try {
      console.log(`[GRID_BROADCAST] CONNECTING: ${url}`);
      
      // 1. Connect with Timeout
      relay = await Promise.race([
        Relay.connect(url),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_CONNECT')), 4000))
      ]) as any;

      console.log(`[GRID_BROADCAST] CONNECTED: ${url} (${Date.now() - start}ms)`);

      // 2. Publish with Timeout
      await Promise.race([
        relay.publish(event),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_PUBLISH')), 6000))
      ]);

      console.log(`[GRID_BROADCAST] SUCCESS: ${url} (${Date.now() - start}ms)`);
    } catch (e: any) {
      console.error(`[GRID_BROADCAST] FAILED: ${url} -> ${e.message} (${Date.now() - start}ms)`);
    } finally {
      if (relay) {
        try {
          relay.close();
        } catch (err) {}
      }
    }
  });

  // We use allSettled to ensure we try all relays even if some fail
  await Promise.allSettled(promises);
  console.log(`[GRID_BROADCAST] FINISHED: Broadcast attempt complete.`);
}
