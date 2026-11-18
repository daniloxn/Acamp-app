import { BookOpen, Plus, Trash2, X } from 'lucide-react';
import type { StudySubject, SubjectSource } from './studySubjects';

type Props = {
  subjects: StudySubject[];
  formOpen: boolean;
  editingId: string | null;
  newName: string;
  newGoal: string;
  newLevel: StudySubject['level'];
  draftSources: SubjectSource[];
  linkInput: string;
  sourceError: string;
  storageError: string;
  readingFile: boolean;
  preparingQuiz: Record<string, 'preparing' | 'ready' | 'error'>;
  onOpenForm: () => void;
  onSubmit: () => void;
  onCancelForm: () => void;
  onNameChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onLevelChange: (value: StudySubject['level']) => void;
  onAddFiles: (files: FileList | null) => void;
  onLinkChange: (value: string) => void;
  onAddLink: () => void;
  onRemoveSource: (sourceId: string) => void;
  onEdit: (subject: StudySubject) => void;
  onDelete: (subject: StudySubject) => void;
  onContinue: (subject: StudySubject) => void;
};

/** Exibe a lista de matérias e o formulário de materiais do aluno. */
export default function SubjectDashboard(props: Props) {
  const sortedSubjects = [...props.subjects].sort((leftSubject, rightSubject) => rightSubject.updatedAt - leftSubject.updatedAt);

  return <div className="subjects-page">
    <div className="subjects-intro"><div><span className="eyebrow">SEU ESPAÇO DE ESTUDO</span><h1>Meus assuntos</h1><p>Escolha um assunto para continuar estudando.</p></div>{!props.formOpen && <button className="primary subject-new" type="button" onClick={props.onOpenForm}><Plus size={17}/> Novo assunto</button>}</div>
    {props.formOpen && <form className="subject-create" onSubmit={event => { event.preventDefault(); props.onSubmit(); }}>
      <div className="subject-form-head"><h2>{props.editingId ? 'Editar assunto e materiais' : 'Novo assunto'}</h2><button type="button" className="secondary" onClick={props.onCancelForm}>Cancelar</button></div>
      <label>Nome do assunto<input value={props.newName} onChange={event => props.onNameChange(event.target.value)} maxLength={80} placeholder="Ex.: Biologia celular" required/></label>
      <label>Objetivo (opcional)<input value={props.newGoal} onChange={event => props.onGoalChange(event.target.value)} maxLength={200} placeholder="Ex.: preparar a prova de sexta-feira"/></label>
      <label>Como você se avalia hoje?<select value={props.newLevel} onChange={event => props.onLevelChange(event.target.value as StudySubject['level'])}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select></label>
      <div className="source-editor"><h3>Materiais para estudar</h3><p>Adicione arquivos com o conteúdo do estudo ou links de referência. Você também pode acrescentar materiais depois.</p>
        <label className="file-add">{props.readingFile ? 'Lendo arquivos...' : 'Adicionar arquivos PDF, DOCX, TXT ou MD'}<input type="file" accept=".pdf,.docx,.txt,.md" multiple disabled={props.readingFile} onChange={event => { props.onAddFiles(event.target.files); event.target.value = ''; }}/></label>
        <div className="link-add"><input aria-label="Link do material" type="url" placeholder="https://..." value={props.linkInput} onChange={event => props.onLinkChange(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); props.onAddLink(); } }}/><button type="button" className="secondary" onClick={props.onAddLink}>Adicionar link</button></div>
        {props.draftSources.map(source => <div className="source-row" key={source.id}><span>{source.kind === 'file' ? 'Arquivo' : 'Link'} · {source.name}</span><button type="button" aria-label={`Remover ${source.name}`} onClick={() => props.onRemoveSource(source.id)}><X size={16}/></button></div>)}
        <small>O texto dos arquivos será usado no chat. Links são referências; o ACAMP ainda não lê automaticamente seu conteúdo.</small>{props.sourceError && <p className="source-error" role="alert">{props.sourceError}</p>}
      </div><button className="primary" type="submit" disabled={props.readingFile}><Plus size={17}/> {props.editingId ? 'Salvar alterações' : 'Criar assunto'}</button>
    </form>}
    {props.storageError && <p className="source-error" role="alert">{props.storageError}</p>}
    {props.subjects.length === 0 && !props.formOpen && <div className="subjects-empty"><BookOpen size={24}/><strong>Nenhum assunto ainda</strong><p>Crie um assunto e adicione o material que você quer estudar.</p></div>}
    {props.subjects.length > 0 && <section className="subject-list"><h2>Continuar estudando</h2>{sortedSubjects.map(subject => <div key={subject.id} className="subject-card"><span className="subject-card-icon"><BookOpen size={20}/></span><span className="subject-card-details"><strong>{subject.name}</strong><small>{subject.stage} · {subject.level} · {subject.sources.length} materiais · {subject.messages.length} mensagens{props.preparingQuiz[subject.id] === 'preparing' ? ' · preparando questões' : props.preparingQuiz[subject.id] === 'ready' ? ' · questões prontas' : props.preparingQuiz[subject.id] === 'error' ? ' · questões pendentes' : ''}</small></span><button type="button" className="subject-edit" onClick={() => props.onEdit(subject)}>Materiais</button><button type="button" className="subject-delete" aria-label={`Apagar ${subject.name}`} onClick={() => props.onDelete(subject)}><Trash2 size={16}/></button><button type="button" className="subject-open" onClick={() => props.onContinue(subject)}>Continuar</button></div>)}</section>}
  </div>;
}
