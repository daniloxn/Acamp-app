import { Channel, invoke } from '@tauri-apps/api/core';
import type { Message, StudySubject } from './studySubjects';

/** Configuração escolhida pelo aluno para executar a IA instalada localmente. */
export type StudyCliConfig = { program: string; args: string };
export type CliStreamEvent = { kind: 'status' | 'step' | 'text' | 'diagnostic' | 'error'; text: string };

/** Envia uma mensagem com histórico e contexto da matéria ao comando Tauri. */
export async function requestStudyReply(
  cliConfig: StudyCliConfig,
  studySubject: StudySubject,
  promptText: string,
  sessionId: string,
  persistentSession: boolean,
  onStreamEvent: (event: CliStreamEvent) => void,
  forceOneShot = false,
): Promise<string> {
  const previousMessages = studySubject.messages.filter(message => !message.error && !message.command);
  const studyContext = {
    subjectId: studySubject.id,
    name: studySubject.name,
    goal: studySubject.goal,
    stage: studySubject.stage,
    level: studySubject.level,
    conversationSummary: studySubject.conversationSummary,
    sources: studySubject.sources,
  };
  if (!persistentSession || forceOneShot) {
    const statusText = forceOneShot
      ? 'Executando este comando diretamente no CLI.'
      : 'Este CLI não mantém uma sessão de entrada; iniciando esta mensagem separadamente.';
    onStreamEvent({ kind: 'status', text: statusText });
    return invoke<string>('run_cli', {
      program: cliConfig.program,
      args: cliConfig.args,
      prompt: promptText,
      history: previousMessages,
      context: studyContext,
    });
  }
  const eventChannel = new Channel<CliStreamEvent>();
  eventChannel.onmessage = onStreamEvent;
  return invoke<string>('run_cli_stream', {
    sessionId,
    prompt: promptText,
    history: previousMessages,
    context: studyContext,
    onEvent: eventChannel,
  });
}

/** Cria as mensagens locais para exibir entrada, resposta ou falha da conversa. */
export function createStudentMessage(promptText: string, isCommand = false): Message {
  return { role: 'user', text: promptText, command: isCommand };
}

export function createAssistantMessage(replyText: string, isCommand = false): Message {
  return { role: 'assistant', text: replyText || 'O comando terminou sem produzir uma resposta.', command: isCommand };
}

export function createConversationError(error: unknown): Message {
  return { role: 'assistant', text: String(error), error: true };
}
