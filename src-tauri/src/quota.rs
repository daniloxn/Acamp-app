//! Consulta e normalização das cotas informadas pelo CLI configurado.
use serde::Serialize;
use std::process::{Command, Stdio};
use crate::cli::resolved_program;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct QuotaBucket { pub(crate) name: String, pub(crate) remaining_percent: u8, pub(crate) reset_time: Option<String> }

#[derive(Serialize)]
pub(crate) struct QuotaGroup { pub(crate) name: String, pub(crate) buckets: Vec<QuotaBucket> }

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CliUsage { pub(crate) provider: String, pub(crate) available: bool, pub(crate) message: String, pub(crate) groups: Vec<QuotaGroup> }
#[tauri::command]
pub(crate) async fn get_cli_usage(program: String) -> Result<CliUsage, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let executable = resolved_program(&program)?;
        if !executable.to_lowercase().contains("agy") {
            return Ok(CliUsage { provider: executable, available: false, message: "O Gemini CLI mostra a cota em /stats model no terminal interativo; ela não está disponível para consulta automática neste modo.".into(), groups: Vec::new() });
        }
        let output = Command::new(&executable).args(["--print", "/usage", "--output-format", "json"])
            .stdout(Stdio::piped()).stderr(Stdio::piped()).output()
            .map_err(|error| format!("Não foi possível consultar a cota do agy: {error}"))?;
        if !output.status.success() {
            return Err(format!("A consulta de cota do agy falhou: {}", String::from_utf8_lossy(&output.stderr).trim()));
        }
        parse_agy_usage(&output.stdout)
    }).await.map_err(|error| format!("Falha interna ao consultar a cota: {error}"))?
}

pub(crate) fn parse_agy_usage(raw: &[u8]) -> Result<CliUsage, String> {
    let value: serde_json::Value = serde_json::from_slice(raw).map_err(|_| "O agy devolveu um formato de cota desconhecido.".to_string())?;
    if value.pointer("/command/name").and_then(|item| item.as_str()) != Some("usage") {
        return Err("O agy não devolveu dados de cota nesta versão.".into());
    }
    let groups = value.pointer("/command/data/groups").and_then(|item| item.as_array())
        .ok_or_else(|| "O agy não devolveu grupos de cota.".to_string())?;
    let groups: Vec<QuotaGroup> = groups.iter().filter_map(|group| {
        let name = group.get("name")?.as_str()?.to_string();
        let buckets = group.get("buckets")?.as_array()?.iter().filter_map(|bucket| {
            let remaining = bucket.get("remaining_fraction")?.as_f64()?;
            if !remaining.is_finite() { return None; }
            Some(QuotaBucket {
                name: bucket.get("name")?.as_str()?.to_string(),
                remaining_percent: (remaining.clamp(0.0, 1.0) * 100.0).round() as u8,
                reset_time: bucket.get("reset_time").and_then(|item| item.as_str()).map(str::to_string),
            })
        }).collect();
        Some(QuotaGroup { name, buckets })
    }).collect();
    if groups.is_empty() { return Err("O agy devolveu uma lista de cotas vazia.".into()); }
    Ok(CliUsage { provider: "agy".into(), available: true, message: "Percentual restante informado pelo agy.".into(), groups })
}


