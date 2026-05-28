mod nostr_relay;
mod wireguard;

use std::sync::Arc;
use parking_lot::RwLock;
use tokio::sync::oneshot;
use tauri::{AppHandle, Manager};
use nostr_relay::{RelayState, start_relay_server};
use wireguard::{WireGuardConfig, WireGuardStatus, WireGuardManager};

pub struct AppState {
    pub relay_state: Arc<RwLock<Option<(Arc<RwLock<RelayState>>, oneshot::Sender<()>)>>>,
    pub wireguard: Arc<WireGuardManager>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_relay_status(state: tauri::State<'_, AppState>) -> serde_json::Value {
    let r = state.relay_state.read();
    if let Some((relay, _)) = r.as_ref() {
        let s = relay.read();
        serde_json::json!({
            "running": s.running,
            "port": s.port,
            "connections": s.connections.len(),
            "events": s.events.len(),
        })
    } else {
        serde_json::json!({
            "running": false,
            "port": 0,
            "connections": 0,
            "events": 0,
        })
    }
}

#[tauri::command]
async fn start_relay(port: u16, state: tauri::State<'_, AppState>, app_handle: AppHandle) -> Result<(), String> {
    let mut r = state.relay_state.write();
    if r.is_some() {
        return Err("Relay is already running".to_string());
    }
    
    let storage_dir = app_handle.path().app_data_dir().ok();
    let (relay, shutdown_tx) = start_relay_server(port, storage_dir);
    *r = Some((relay, shutdown_tx));
    Ok(())
}

#[tauri::command]
fn stop_relay(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut r = state.relay_state.write();
    if let Some((_, shutdown_tx)) = r.take() {
        let _ = shutdown_tx.send(());
        Ok(())
    } else {
        Err("Relay is not running".to_string())
    }
}

#[tauri::command]
fn get_wireguard_status(state: tauri::State<'_, AppState>) -> WireGuardStatus {
    state.wireguard.get_status()
}

#[tauri::command]
fn get_wireguard_config(state: tauri::State<'_, AppState>) -> WireGuardConfig {
    state.wireguard.load_config()
}

#[tauri::command]
fn save_wireguard_config(config: WireGuardConfig, state: tauri::State<'_, AppState>) -> Result<(), String> {
    state.wireguard.save_config(&config)
}

#[tauri::command]
fn toggle_wireguard(active: bool, state: tauri::State<'_, AppState>) -> Result<WireGuardStatus, String> {
    state.wireguard.set_tunnel_state(active)
}

#[tauri::command]
fn ping_vpn_peer(ip: String, state: tauri::State<'_, AppState>) -> Result<u32, String> {
    state.wireguard.ping_peer(&ip)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle();
            let storage_dir = app_handle.path().app_data_dir().ok();
            
            // Create config directory for WireGuard
            let config_dir = storage_dir.clone().unwrap_or_else(|| std::path::PathBuf::from("."));
            let wireguard_manager = Arc::new(WireGuardManager::new(config_dir));
            
            // Automatically start Nostr Relay on default port 4869
            let (relay, shutdown_tx) = start_relay_server(4869, storage_dir);
            
            app.manage(AppState {
                relay_state: Arc::new(RwLock::new(Some((relay, shutdown_tx)))),
                wireguard: wireguard_manager,
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_relay_status,
            start_relay,
            stop_relay,
            get_wireguard_status,
            get_wireguard_config,
            save_wireguard_config,
            toggle_wireguard,
            ping_vpn_peer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

