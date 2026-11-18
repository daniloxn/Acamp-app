import type { StudyCliConfig } from './conversation';

const CLI_CONFIG_STORAGE_KEY = 'acamp-cli';
const DEFAULT_CLI_CONFIG: StudyCliConfig = { program: 'auto', args: '' };

/** Lê a configuração persistida e converte o nome antigo do comando para o modo automático. */
export function loadCliConfig(): StudyCliConfig {
  try {
    const savedConfig: unknown = JSON.parse(localStorage.getItem(CLI_CONFIG_STORAGE_KEY) || '');
    if (!savedConfig || typeof savedConfig !== 'object') return DEFAULT_CLI_CONFIG;
    const candidateConfig = savedConfig as Partial<StudyCliConfig>;
    if (candidateConfig.program === 'antigravity') return DEFAULT_CLI_CONFIG;
    return {
      program: typeof candidateConfig.program === 'string' ? candidateConfig.program : DEFAULT_CLI_CONFIG.program,
      args: typeof candidateConfig.args === 'string' ? candidateConfig.args : DEFAULT_CLI_CONFIG.args,
    };
  } catch {
    return DEFAULT_CLI_CONFIG;
  }
}

/** Persiste uma configuração de CLI já normalizada pelo formulário. */
export function saveCliConfig(cliConfig: StudyCliConfig): void {
  localStorage.setItem(CLI_CONFIG_STORAGE_KEY, JSON.stringify(cliConfig));
}
