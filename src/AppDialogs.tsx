import { Check, LoaderCircle, Trash2, X } from 'lucide-react';
import type { StudyCliConfig } from './conversation';
import type { StudySubject } from './studySubjects';

type Props = {
  deletingSubject: StudySubject | null;
  deleting: boolean;
  deleteError: string;
  settingsOpen: boolean;
  draftConfig: StudyCliConfig;
  onCloseDelete: () => void;
  onDeleteSubject: () => void;
  onDraftConfigChange: (config: StudyCliConfig) => void;
  onCloseSettings: () => void;
  onSaveSettings: () => void;
};

/** Agrupa os diálogos de exclusão de matéria e configuração do CLI. */
export default function AppDialogs(props: Props) {
  return <>
    {props.deletingSubject && <div className="overlay" onMouseDown={event => { if (!props.deleting && event.target === event.currentTarget) props.onCloseDelete(); }}><section className="settings-dialog delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-subject-title" aria-describedby="delete-subject-description"><div className="dialog-head"><div><h2 id="delete-subject-title">Apagar matéria?</h2><p id="delete-subject-description">A matéria <strong>{props.deletingSubject.name}</strong>, sua conversa, materiais, guia e histórico de questões serão removidos deste computador. Essa ação não pode ser desfeita.</p></div><button className="icon-button" aria-label="Fechar" disabled={props.deleting} onClick={props.onCloseDelete}><X size={20}/></button></div>{props.deleteError && <p className="source-error" role="alert">{props.deleteError}</p>}<div className="dialog-actions"><button className="secondary" disabled={props.deleting} onClick={props.onCloseDelete}>Cancelar</button><button className="delete-confirm" disabled={props.deleting} onClick={props.onDeleteSubject}>{props.deleting ? <LoaderCircle size={16} className="spin"/> : <Trash2 size={16}/>} {props.deleting ? 'Apagando...' : 'Apagar matéria'}</button></div></section></div>}
    {props.settingsOpen && <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) props.onCloseSettings(); }}><section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="dialog-head"><div><h2 id="settings-title">Conexão com o CLI</h2><p>Escolha agy ou gemini para responder às conversas.</p></div><button className="icon-button" aria-label="Fechar" onClick={props.onCloseSettings}><X size={20}/></button></div><label>Comando<input value={props.draftConfig.program} onChange={event => props.onDraftConfigChange({ ...props.draftConfig, program: event.target.value })} placeholder="auto, agy, gemini ou caminho completo"/></label><p className="field-help">Use <code>auto</code> para procurar agy primeiro e gemini em seguida.</p><label>Argumentos personalizados (opcional)<input value={props.draftConfig.args} onChange={event => props.onDraftConfigChange({ ...props.draftConfig, args: event.target.value })} placeholder="Padrão: --print para agy; --prompt para gemini"/></label><p className="field-help">Deixe em branco para usar os argumentos corretos automaticamente. Para personalizar, use <code>{'{prompt}'}</code> onde a conversa deve entrar.</p><div className="dialog-actions"><button className="secondary" onClick={props.onCloseSettings}>Cancelar</button><button className="primary" onClick={props.onSaveSettings}><Check size={16}/> Salvar configuração</button></div></section></div>}
  </>;
}
