import type { FormEvent, KeyboardEvent, RefObject } from 'react';
import { ArrowUp, Command, LoaderCircle, Sparkles } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import type { Message, StudySubject } from './studySubjects';
import './study-conversation.css';

const starterPrompts = ['Explique um assunto para mim', 'Crie um quiz de revisão', 'Monte um plano de estudos'];

type Props = {
  subject: StudySubject;
  messages: Message[];
  inputText: string;
  waitingForReply: boolean;
  streamingReply: string;
  cliProgressSteps: string[];
  bottomRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSend: (value?: string) => void;
  onSubjectUpdate: (patch: Partial<StudySubject>) => void;
  onSwitchSubject: () => void;
};

// Mantém as referências copiáveis e evita navegação ou carregamento de recursos a partir da saída da IA.
const replyMarkdownComponents: Components = {
  a: ({ children, href }) => <>{children}{href && <> ({href})</>}</>,
  img: ({ alt }) => alt ?? null,
};

/** Apresenta respostas parciais e concluídas sem interpretar HTML da saída do CLI. */
function StudyReplyMarkdown({ replyText }: { replyText: string }) {
  return <div className="message-text reply-markdown">
    <ReactMarkdown components={replyMarkdownComponents}>{replyText}</ReactMarkdown>
  </div>;
}

/** Renderiza o contexto da matéria, as mensagens e o campo de envio da conversa. */
export default function StudyConversation(props: Props) {
  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSend();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      props.onSend();
    }
  }

  return <>
    <div className="study-context"><div><strong>{props.subject.name}</strong><span>{props.subject.goal || 'Defina seu objetivo para orientar o ACAMP.'}</span></div>
      <label>Etapa atual<input aria-label="Etapa atual" value={props.subject.stage} maxLength={120} onChange={event => props.onSubjectUpdate({ stage: event.target.value })} onBlur={() => { if (!props.subject.stage.trim()) props.onSubjectUpdate({ stage: 'Explorando o assunto' }); }}/></label>
      <label>Nível<select aria-label="Nível de aprendizagem" value={props.subject.level} onChange={event => props.onSubjectUpdate({ level: event.target.value as StudySubject['level'] })}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select></label>
      <button onClick={props.onSwitchSubject}>Trocar assunto</button>
    </div>
    <div className="conversation">{props.messages.length === 0 ? <section className="welcome"><div className="welcome-icon"><Sparkles size={25}/></div><h1>O que vamos aprender hoje?</h1><p>Traga uma dúvida, um tema ou uma meta de estudo. Comece com uma pergunta ou escolha um ponto de partida.</p><div className="suggestions">{starterPrompts.map(promptText => <button key={promptText} onClick={() => props.onInputChange(promptText)}>{promptText}<ArrowUp size={15}/></button>)}</div></section> : <div className="thread" aria-live="polite">
      {props.messages.map((message, messageIndex) => <div className={`message ${message.role} ${message.error ? 'error' : ''}`} key={messageIndex}>
        <div className="avatar">{message.role === 'user' ? 'V' : <Sparkles size={16}/>}</div>
        <div className="message-body">
          <div className="message-name">{message.role === 'user' ? 'Você' : message.error ? 'Falha na execução' : 'ACAMP'}</div>
          {message.role === 'assistant' && !message.error
            ? <StudyReplyMarkdown replyText={message.text}/>
            : <div className="message-text">{message.text}</div>}
        </div>
      </div>)}
      {props.waitingForReply && <div className="message assistant">
        <div className="avatar"><Sparkles size={16}/></div>
        <div className="message-body">
          <div className="message-name">ACAMP</div>
          {props.cliProgressSteps.length > 0 && <div className="cli-progress" aria-live="polite">
            <strong><LoaderCircle size={15} className="spin"/> Atividade do CLI</strong>
            <ol>{props.cliProgressSteps.map((step, stepIndex) => <li key={`${stepIndex}-${step}`}>{step}</li>)}</ol>
          </div>}
          {props.streamingReply
            ? <StudyReplyMarkdown replyText={props.streamingReply}/>
            : <div className="working"><LoaderCircle size={16} className="spin"/> Aguardando os primeiros dados do CLI...</div>}
        </div>
      </div>}
      <div ref={props.bottomRef}/>
    </div>}</div>
    <div className="composer-area"><form className="composer" onSubmit={submitMessage}><textarea aria-label="Sua mensagem" placeholder="Pergunte qualquer coisa sobre seus estudos..." value={props.inputText} onChange={event => props.onInputChange(event.target.value)} onKeyDown={handleComposerKeyDown} rows={2}/><div className="composer-footer"><span><Command size={14}/> Enter para enviar · Shift+Enter para nova linha</span><button type="submit" aria-label="Enviar mensagem" disabled={!props.inputText.trim() || props.waitingForReply}><ArrowUp size={19}/></button></div></form><div className="composer-hint">/help mostra os comandos do CLI · /clear limpa · /compact resume a conversa.</div></div>
  </>;
}
