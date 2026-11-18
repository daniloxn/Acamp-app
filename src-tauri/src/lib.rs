//! Registro das funcionalidades Tauri e inicialização do aplicativo ACAMP.
mod cli;
mod guide;
mod quiz;
mod quota;

#[cfg(test)]
mod tests {
    use crate::guide::{guide_cache_key, read_cached_guide};
    use crate::quota::parse_agy_usage;
    use std::fs;

    #[test]
    fn cache_returns_existing_guide_for_identical_file() {
        let root = std::env::temp_dir().join(format!("acamp-cache-test-{}-{}", std::process::id(), guide_cache_key("unique", "test")));
        fs::create_dir_all(&root).unwrap();
        let key = guide_cache_key("a.pdf", "texto de estudo");
        let path = root.join(format!("{key}.md"));
        fs::write(&path, "# Guia salvo").unwrap();
        assert_eq!(read_cached_guide(&path).unwrap().as_deref(), Some("# Guia salvo"));
        assert_ne!(key, guide_cache_key("a.pdf", "texto alterado"));
        assert_eq!(read_cached_guide(&root.join(format!("{}.md", guide_cache_key("a.pdf", "texto alterado")))).unwrap(), None);
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn parses_remaining_quota_without_confusing_it_with_used_quota() {
        let raw = br#"{"command":{"name":"usage","data":{"groups":[{"name":"Gemini Models","buckets":[{"name":"Weekly Limit Remaining","remaining_fraction":0.81,"reset_time":"2026-11-21T04:46:30Z"}]}]}}}"#;
        let usage = parse_agy_usage(raw).unwrap();
        assert_eq!(usage.groups[0].buckets[0].remaining_percent, 81);
        assert_eq!(usage.groups[0].buckets[0].reset_time.as_deref(), Some("2026-11-21T04:46:30Z"));
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let application = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![cli::check_cli, cli::start_cli_session, cli::stop_cli_session, quota::get_cli_usage, cli::run_cli, cli::run_cli_stream, guide::generate_study_guide, quiz::load_quiz_state, quiz::start_quiz_round, quiz::answer_quiz_question, quiz::advance_quiz_question, quiz::delete_subject_data])
        .build(tauri::generate_context!())
        .expect("error while building ACAMP");
    application.run(|_, event| {
        if matches!(event, tauri::RunEvent::Exit) {
            cli::shutdown_cli_session();
        }
    });
}

