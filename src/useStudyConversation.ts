import { useEffect, useRef, useState } from 'react';
import { createConversationSummaryPrompt, isStandaloneCliCommand, parseAcampCommand } from './cliCommands';
import { createAssistantMessage, createConversationError, createStudentMessage, requestStudyReply, type CliStreamEvent, type StudyCliConfig } from './conversation';
import type { Message, StudySubject } from './studySubjects';

type Props = {
  activeSubject: StudySubject | undefined;
  cliConfig: StudyCliConfig;
  sessionId: string;
  isPersistentSession: boolean;
  isTauriRuntime: boolean;
  onSubjectUpdate: (subjectId: string, changes: Partial<StudySubject>) => void;
  onMessageAppend: (subjectId: string, message: Message) => void;
  onClearConversation: (subjectId: string) => void;
  onRestartCliSession: () => Promise<void>;
  onAiActivity: () => void;
};

/** Controla o envio de mensagens e a rolagem para a atividade mais recente. */
export function useStudyConversation({ activeSubject, cliConfig, sessionId, isPersistentSession, isTauriRuntime, onSubjectUpdate, onMessageAppend, onClearConversation, onRestartCliSession, onAiActivity }: Props) {
  const [draftMessage, setDraftMessage] = useState('');
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const [streamingReply, setStreamingReply] = useState('');
  const [cliProgressSteps, setCliProgressSteps] = useState<string[]>([]);
  const streamingReplyRef = useRef('');
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const conversationMessages = activeSubject?.messages ?? [];

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, isWaitingForReply]);

  async function sendMessage(messageOverride = draftMessage) {
    const promptText = messageOverride.trim();
    if (!promptText || isWaitingForReply || !activeSubject) return;
    const selectedSubject = activeSubject;
    const acampCommand = parseAcampCommand(promptText);
    if (acampCommand?.name === 'clear') {
      setDraftMessage('');
      setIsWaitingForReply(true);
      setCliProgressSteps(['Limpando o histórico e reiniciando a sessão do agente.']);
      try {
        onClearConversation(selectedSubject.id);
        if (isPersistentSession) await onRestartCliSession();
        onMessageAppend(selectedSubject.id, createAssistantMessage('Conversa limpa. O agente começará com um contexto novo.', true));
      } catch (error) {
        onMessageAppend(selectedSubject.id, createConversationError(error));
      } finally {
        setIsWaitingForReply(false);
        onAiActivity();
      }
      return;
    }
    onSubjectUpdate(selectedSubject.id, { messages: [...selectedSubject.messages, createStudentMessage(promptText, Boolean(acampCommand) || promptText.startsWith('/'))] });
    setDraftMessage('');
    setIsWaitingForReply(true);
    setStreamingReply('');
    streamingReplyRef.current = '';
    setCliProgressSteps(['Enviando solicitação ao CLI.']);
    try {
      if (!isTauriRuntime) throw new Error('Abra o ACAMP pelo aplicativo Tauri para executar o CLI.');
      const agentPrompt = acampCommand?.name === 'compact'
        ? createConversationSummaryPrompt(acampCommand.argument)
        : promptText;
      const assistantReply = await requestStudyReply(cliConfig, selectedSubject, agentPrompt, sessionId, isPersistentSession, handleCliStreamEvent, isStandaloneCliCommand(promptText));
      if (acampCommand?.name === 'compact') {
        if (!assistantReply.trim()) throw new Error('O agente não retornou um resumo para compactar a conversa.');
        if (isPersistentSession) await onRestartCliSession();
        onSubjectUpdate(selectedSubject.id, { conversationSummary: assistantReply.trim() });
        onMessageAppend(selectedSubject.id, createAssistantMessage('Conversa compactada. O histórico continua visível, e as próximas respostas usarão um resumo para economizar contexto.', true));
        return;
      }
      onMessageAppend(selectedSubject.id, createAssistantMessage(assistantReply, promptText.startsWith('/')));
    } catch (error) {
      if (streamingReplyRef.current.trim()) onMessageAppend(selectedSubject.id, createAssistantMessage(streamingReplyRef.current));
      onMessageAppend(selectedSubject.id, createConversationError(error));
    } finally {
      setIsWaitingForReply(false);
      setStreamingReply('');
      streamingReplyRef.current = '';
      onAiActivity();
    }
  }

  function handleCliStreamEvent(event: CliStreamEvent) {
    if (event.kind === 'text') {
      streamingReplyRef.current += event.text;
      setStreamingReply(previousText => previousText + event.text);
    }
    if (event.kind === 'step' || event.kind === 'status' || event.kind === 'diagnostic' || event.kind === 'error') {
      setCliProgressSteps(previousSteps => [...previousSteps.slice(-5), event.text]);
    }
  }

  return { conversationMessages, draftMessage, setDraftMessage, isWaitingForReply, streamingReply, cliProgressSteps, latestMessageRef, sendMessage };
}
