use reqwest::Client;
use serde_json::Value;

#[tauri::command]
async fn cf_api(
    account_id: String,
    token: String,
    path: String, // e.g. "vectorize/v2/indexes"
    method: String,
    body: Option<Value>, 
) -> Result<Value, String> {
    let url = format!(
        "https://api.cloudflare.com/client/v4/accounts/{}/{}",
        account_id, path
    );

    let client = Client::new();
    let mut req = match method.as_str() {
        "POST" => client.post(&url),
        "GET" => client.get(&url),
        _ => return Err("Unsupported request method".to_string()),
    };

    req = req
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/json");

    if let Some(b) = body {
        req = req.json(&b);
    }

    let res = req.send().await.map_err(|e| e.to_string())?;
    let json: Value = res.json().await.map_err(|e| e.to_string())?;
    
    Ok(json)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![cf_api])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}