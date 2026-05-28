use std::collections::HashMap;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use futures_util::{SinkExt, StreamExt};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{mpsc, oneshot};
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct NostrEvent {
    pub id: String,
    pub pubkey: String,
    pub created_at: u64,
    pub kind: u64,
    pub tags: Vec<Vec<String>>,
    pub content: String,
    pub sig: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct NostrFilter {
    pub ids: Option<Vec<String>>,
    pub authors: Option<Vec<String>>,
    pub kinds: Option<Vec<u64>>,
    pub limit: Option<usize>,
    #[serde(rename = "#p")]
    pub p_tag: Option<Vec<String>>,
    #[serde(rename = "#e")]
    pub e_tag: Option<Vec<String>>,
}

impl NostrFilter {
    pub fn matches(&self, event: &NostrEvent) -> bool {
        if let Some(ref ids) = self.ids {
            if !ids.iter().any(|id| event.id.starts_with(id)) {
                return false;
            }
        }
        if let Some(ref authors) = self.authors {
            if !authors.iter().any(|author| event.pubkey.starts_with(author)) {
                return false;
            }
        }
        if let Some(ref kinds) = self.kinds {
            if !kinds.contains(&event.kind) {
                return false;
            }
        }
        if let Some(ref p_tags) = self.p_tag {
            let event_p_tags: Vec<&str> = event.tags.iter()
                .filter(|t| t.len() >= 2 && t[0] == "p")
                .map(|t| t[1].as_str())
                .collect();
            if !p_tags.iter().any(|p| event_p_tags.contains(&p.as_str())) {
                return false;
            }
        }
        if let Some(ref e_tags) = self.e_tag {
            let event_e_tags: Vec<&str> = event.tags.iter()
                .filter(|t| t.len() >= 2 && t[0] == "e")
                .map(|t| t[1].as_str())
                .collect();
            if !e_tags.iter().any(|e| event_e_tags.contains(&e.as_str())) {
                return false;
            }
        }
        true
    }
}

type Tx = mpsc::UnboundedSender<Message>;

pub struct Connection {
    pub tx: Tx,
    pub subscriptions: HashMap<String, Vec<NostrFilter>>,
}

pub struct RelayState {
    pub events: Vec<NostrEvent>,
    pub connections: HashMap<String, Connection>,
    pub storage_path: Option<PathBuf>,
    pub port: u16,
    pub running: bool,
}

impl RelayState {
    pub fn new(port: u16, storage_dir: Option<PathBuf>) -> Self {
        let storage_path = storage_dir.map(|d| d.join("events.jsonl"));
        let mut events = Vec::new();

        // Load events from file if it exists
        if let Some(ref path) = storage_path {
            if path.exists() {
                if let Ok(file_content) = std::fs::read_to_string(path) {
                    for line in file_content.lines() {
                        if let Ok(event) = serde_json::from_str::<NostrEvent>(line) {
                            events.push(event);
                        }
                    }
                }
            }
        }

        Self {
            events,
            connections: HashMap::new(),
            storage_path,
            port,
            running: false,
        }
    }

    pub fn save_event(&mut self, event: NostrEvent) {
        self.events.push(event.clone());
        if let Some(ref path) = self.storage_path {
            // Ensure parent directory exists
            if let Some(parent) = path.parent() {
                let _ = std::fs::create_dir_all(parent);
            }
            if let Ok(line) = serde_json::to_string(&event) {
                use std::fs::OpenOptions;
                use std::io::Write;
                if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
                    let _ = writeln!(file, "{}", line);
                }
            }
        }
    }
}

pub fn start_relay_server(
    port: u16,
    storage_dir: Option<PathBuf>,
) -> (Arc<RwLock<RelayState>>, oneshot::Sender<()>) {
    let state = Arc::new(RwLock::new(RelayState::new(port, storage_dir)));
    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();

    let state_clone = Arc::clone(&state);
    tauri::async_runtime::spawn(async move {
        let addr = SocketAddr::from(([0, 0, 0, 0], port));
        let listener = match TcpListener::bind(&addr).await {
            Ok(l) => {
                println!("[Nostr Relay] Listening on ws://{}", addr);
                {
                    let mut s = state_clone.write();
                    s.running = true;
                }
                l
            }
            Err(e) => {
                eprintln!("[Nostr Relay] Failed to bind to address {}: {:?}", addr, e);
                return;
            }
        };

        let local_state = Arc::clone(&state_clone);
        let mut shutdown_rx = shutdown_rx;

        tokio::select! {
            _ = async {
                loop {
                    match listener.accept().await {
                        Ok((stream, peer_addr)) => {
                            let state_ref = Arc::clone(&local_state);
                            tauri::async_runtime::spawn(async move {
                                handle_connection(stream, peer_addr, state_ref).await;
                            });
                        }
                        Err(e) => {
                            eprintln!("[Nostr Relay] Error accepting TCP connection: {:?}", e);
                        }
                    }
                }
            } => {}
            _ = &mut shutdown_rx => {
                println!("[Nostr Relay] Shutting down relay server on port {}", port);
            }
        }

        let mut s = state_clone.write();
        s.running = false;
        // Clean up connections
        s.connections.clear();
    });

    (state, shutdown_tx)
}

async fn handle_connection(
    stream: TcpStream,
    peer_addr: SocketAddr,
    state: Arc<RwLock<RelayState>>,
) {
    let ws_stream = match tokio_tungstenite::accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("[Nostr Relay] WebSocket handshake failed for {}: {:?}", peer_addr, e);
            return;
        }
    };

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();
    let conn_id = Uuid::new_v4().to_string();

    // Register connection
    {
        let mut s = state.write();
        s.connections.insert(
            conn_id.clone(),
            Connection {
                tx,
                subscriptions: HashMap::new(),
            },
        );
    }

    println!("[Nostr Relay] Peer connected: {} (ID: {})", peer_addr, conn_id);

    // Spawn a writer task for this connection
    let writer_conn_id = conn_id.clone();
    let writer_state = Arc::clone(&state);
    tauri::async_runtime::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_sender.send(msg).await.is_err() {
                break;
            }
        }
        // Cleanup on connection closed
        let mut s = writer_state.write();
        s.connections.remove(&writer_conn_id);
        println!("[Nostr Relay] Peer disconnected: {} (ID: {})", peer_addr, writer_conn_id);
    });

    // Read incoming messages
    while let Some(result) = ws_receiver.next().await {
        let msg = match result {
            Ok(m) => m,
            Err(_) => break,
        };

        if msg.is_text() {
            if let Ok(text) = msg.to_text() {
                if let Err(e) = handle_nostr_message(&conn_id, text, &state).await {
                    eprintln!("[Nostr Relay] Error processing message from {}: {:?}", peer_addr, e);
                }
            }
        } else if msg.is_close() {
            break;
        }
    }
}

async fn handle_nostr_message(
    conn_id: &str,
    msg_text: &str,
    state: &Arc<RwLock<RelayState>>,
) -> Result<(), Box<dyn std::error::Error>> {
    let parsed: serde_json::Value = serde_json::from_str(msg_text)?;
    if !parsed.is_array() {
        return Err("Nostr message must be a JSON array".into());
    }

    let array = parsed.as_array().ok_or("Message is not an array")?;
    if array.is_empty() {
        return Err("Empty array".into());
    }

    let msg_type = array[0].as_str().ok_or("Message type must be a string")?;

    match msg_type {
        "EVENT" => {
            if array.len() < 2 {
                return Err("EVENT message missing payload".into());
            }
            let event: NostrEvent = serde_json::from_value(array[1].clone())?;
            let event_id = event.id.clone();

            // Store event
            let subscribers_to_notify: Vec<(Tx, String)> = {
                let mut s = state.write();
                s.save_event(event.clone());

                // Find active connections that match this event's filters
                let mut matches = Vec::new();
                for (_, conn) in s.connections.iter() {
                    for (sub_id, filters) in conn.subscriptions.iter() {
                        if filters.is_empty() || filters.iter().any(|f| f.matches(&event)) {
                            matches.push((conn.tx.clone(), sub_id.clone()));
                        }
                    }
                }
                matches
            };

            // Notify subscribers
            for (tx, sub_id) in subscribers_to_notify {
                let msg_payload = json!(["EVENT", sub_id, event]).to_string();
                let _ = tx.send(Message::Text(msg_payload));
            }

            // Acknowledge event
            let ack = json!(["OK", event_id, true, ""]).to_string();
            let tx = {
                let s = state.read();
                s.connections.get(conn_id).map(|c| c.tx.clone())
            };
            if let Some(t) = tx {
                let _ = t.send(Message::Text(ack));
            }
        }
        "REQ" => {
            if array.len() < 3 {
                return Err("REQ message missing parameters".into());
            }
            let sub_id = array[1].as_str().ok_or("Subscription ID must be a string")?.to_string();
            
            let mut filters = Vec::new();
            for item in array.iter().skip(2) {
                if let Ok(filter) = serde_json::from_value::<NostrFilter>(item.clone()) {
                    filters.push(filter);
                }
            }

            // Save subscriptions
            let mut matched_events = Vec::new();
            {
                let mut s = state.write();
                
                // Get all matching stored events
                for event in s.events.iter() {
                    if filters.is_empty() || filters.iter().any(|f| f.matches(event)) {
                        matched_events.push(event.clone());
                    }
                }

                if let Some(conn) = s.connections.get_mut(conn_id) {
                    conn.subscriptions.insert(sub_id.clone(), filters.clone());
                }
            }

            // Push stored events to client
            let tx = {
                let s = state.read();
                s.connections.get(conn_id).map(|c| c.tx.clone())
            };

            if let Some(t) = tx {
                // Apply limit filter if specified
                // Find minimum limit among all filters
                let limit = filters.iter().filter_map(|f| f.limit).min();
                if let Some(l) = limit {
                    if matched_events.len() > l {
                        // Take the last l events
                        let start = matched_events.len() - l;
                        matched_events = matched_events[start..].to_vec();
                    }
                }

                for event in matched_events {
                    let msg_payload = json!(["EVENT", sub_id, event]).to_string();
                    let _ = t.send(Message::Text(msg_payload));
                }

                // Send EOSE (End of Stored Events)
                let eose = json!(["EOSE", sub_id]).to_string();
                let _ = t.send(Message::Text(eose));
            }
        }
        "CLOSE" => {
            if array.len() < 2 {
                return Err("CLOSE message missing subscription ID".into());
            }
            let sub_id = array[1].as_str().ok_or("Subscription ID must be a string")?;
            
            let mut s = state.write();
            if let Some(conn) = s.connections.get_mut(conn_id) {
                conn.subscriptions.remove(sub_id);
            }
        }
        _ => {
            println!("[Nostr Relay] Unknown message type: {}", msg_type);
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_filter_matching() {
        let event = NostrEvent {
            id: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef".to_string(),
            pubkey: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890".to_string(),
            created_at: 1700000000,
            kind: 1,
            tags: vec![
                vec!["p".to_string(), "target_pubkey".to_string()],
                vec!["e".to_string(), "target_event_id".to_string()],
            ],
            content: "Hello Nostr".to_string(),
            sig: "signature".to_string(),
        };

        // Kind filter matching
        let filter1 = NostrFilter {
            ids: None,
            authors: None,
            kinds: Some(vec![1, 2]),
            limit: None,
            p_tag: None,
            e_tag: None,
        };
        assert!(filter1.matches(&event));

        // Kind mismatch
        let filter2 = NostrFilter {
            ids: None,
            authors: None,
            kinds: Some(vec![0, 3]),
            limit: None,
            p_tag: None,
            e_tag: None,
        };
        assert!(!filter2.matches(&event));

        // Author filter prefix matching
        let filter3 = NostrFilter {
            ids: None,
            authors: Some(vec!["abc".to_string()]),
            kinds: None,
            limit: None,
            p_tag: None,
            e_tag: None,
        };
        assert!(filter3.matches(&event));

        // Tag filter matching (#p)
        let filter4 = NostrFilter {
            ids: None,
            authors: None,
            kinds: None,
            limit: None,
            p_tag: Some(vec!["target_pubkey".to_string()]),
            e_tag: None,
        };
        assert!(filter4.matches(&event));
        
        // Tag filter mismatch (#e)
        let filter5 = NostrFilter {
            ids: None,
            authors: None,
            kinds: None,
            limit: None,
            p_tag: None,
            e_tag: Some(vec!["other_event_id".to_string()]),
        };
        assert!(!filter5.matches(&event));
    }
}

