/** Interpreta apenas comandos locais do ACAMP; os demais são encaminhados ao CLI. */
export type AcampCommand = { name: 'clear' | 'compact'; argument: string };

const standaloneCliCommands = new Set([
  'agents', 'changelog', 'config', 'credits', 'effort', 'help', 'hooks',
  'model', 'permissions', 'plugin', 'quota', 'settings', 'skills', 'usage',
]);

export function parseAcampCommand(inputText: string): AcampCommand | undefined {
  const commandMatch = inputText.trim().match(/^\/(clear|compact)(?:\s+([\s\S]*))?$/i);
  if (!commandMatch) return undefined;
  return { name: commandMatch[1].toLowerCase() as AcampCommand['name'], argument: commandMatch[2]?.trim() ?? '' };
}

/** Identifica consultas de barra que o agy responde fora da sessão persistente. */
export function isStandaloneCliCommand(inputText: string): boolean {
  const commandName = inputText.trim().match(/^\/([a-z][\w-]*)\b/i)?.[1]?.toLowerCase();
  return commandName ? standaloneCliCommands.has(commandName) : false;
}

/** Gera uma instrução de síntese concisa para compactar a memória da conversa. */
export function createConversationSummaryPrompt(additionalDirection: string): string {
  const requestedDirection = additionalDirection
    ? ` Considere também esta orientação: ${additionalDirection}`
    : '';
  return `Resuma a conversa de estudo anterior para que outro contexto possa continuá-la. Preserve o assunto, dúvidas, explicações importantes, decisões, pontos ainda não compreendidos e a próxima etapa sugerida. Seja conciso, factual, em português, e não responda como se fosse uma mensagem comum.${requestedDirection}`;
}
