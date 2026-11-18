import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { BookOpen, BookOpenText, Brain, ChevronDown, MessageCircle, Plus, Settings2 } from 'lucide-react';
import AppDialogs from './AppDialogs';
import CliQuota from './CliQuota';
import { loadCliConfig, saveCliConfig } from './cliConfig';
import type { StudyCliConfig } from './conversation';
import SmartStudy from './SmartStudy';
import StudyConversation from './StudyConversation';
import StudyGuide from './StudyGuide';
import SubjectDashboard from './SubjectDashboard';
import type { StudySubject } from './studySubjects';
import { useStudyConversation } from './useStudyConversation';
import { useStudySubjects } from './useStudySubjects';

// Detecta a ponte nativa uma vez para configurar os recursos dependentes do Tauri.
const isTauriRuntime = '__TAURI_INTERNALS__' in window;
type StudyTab = 'chat' | 'guide' | 'smart';
type CliStatus = 'checking' | 'ready' | 'missing' | 'browser';

/** Compõe a navegação principal e conecta cada funcionalidade aos seus hooks. */
export default function App() {
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudyTab>('chat');
  const [cliConfig, setCliConfig] = useState<StudyCliConfig>(loadCliConfig);
  const [cliSessionId, setCliSessionId] = useState(() => crypto.randomUUID());
  const currentCliSessionId = useRef(cliSessionId);
  const [isPersistentSession, setIsPersistentSession] = useState(true);
  const [draftCliConfig, setDraftCliConfig] = useState(cliConfig);
  const [cliStatus, setCliStatus] = useState<CliStatus>('checking');
  const [activeCliName, setActiveCliName] = useState('');
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const subjectManager = useStudySubjects(cliConfig, refreshQuota);
  const activeSubject = subjectManager.subjects.find(studySubject => studySubject.id === activeSubjectId);
  const conversation = useStudyConversation({
    activeSubject,
    cliConfig,
    sessionId: cliSessionId,
    isPersistentSession,
    isTauriRuntime,
    onSubjectUpdate: subjectManager.updateSubject,
    onMessageAppend: subjectManager.appendSubjectMessage,
    onClearConversation: subjectId => subjectManager.updateSubject(subjectId, { messages: [], conversationSummary: undefined }),
    onRestartCliSession: restartCliSession,
    onAiActivity: refreshQuota,
  });

  useEffect(() => {
    if (!isTauriRuntime) {
      setCliStatus('browser');
      return;
    }
    setCliStatus('checking');
    const sessionId = crypto.randomUUID();
    currentCliSessionId.current = sessionId;
    setCliSessionId(sessionId);
    setCliStatus('checking');
    invoke<string>('start_cli_session', { program: cliConfig.program, args: cliConfig.args, sessionId })
      .then(executableName => {
        if (currentCliSessionId.current !== sessionId) return;
        setIsPersistentSession(true);
        setActiveCliName(executableName.replace(/\.cmd$/i, ''));
        setCliStatus('ready');
      })
      .catch(async error => {
        if (currentCliSessionId.current !== sessionId) return;
        if (String(error).includes('não oferece a entrada stream-json persistente')) {
          try {
            const executableName = await invoke<string>('check_cli', { program: cliConfig.program });
            if (currentCliSessionId.current !== sessionId) return;
            setIsPersistentSession(false);
            setActiveCliName(`${executableName.replace(/\.cmd$/i, '')} · processo por mensagem`);
            setCliStatus('ready');
            return;
          } catch { /* Abaixo, apresenta o estado de CLI indisponível. */ }
        }
        if (currentCliSessionId.current === sessionId) {
          setActiveCliName('');
          setCliStatus('missing');
        }
      });
    return () => { void invoke('stop_cli_session', { sessionId: currentCliSessionId.current }).catch(() => undefined); };
  }, [cliConfig.program, cliConfig.args]);

  /** Abre uma nova conversa no processo persistente sem alterar a configuração do CLI. */
  async function restartCliSession() {
    if (!isTauriRuntime || !isPersistentSession) return;
    const nextSessionId = crypto.randomUUID();
    currentCliSessionId.current = nextSessionId;
    setCliSessionId(nextSessionId);
    setCliStatus('checking');
    setActiveCliName('');
    try {
      const executableName = await invoke<string>('start_cli_session', {
        program: cliConfig.program,
        args: cliConfig.args,
        sessionId: nextSessionId,
      });
      if (currentCliSessionId.current !== nextSessionId) return;
      setActiveCliName(executableName.replace(/\.cmd$/i, ''));
      setCliStatus('ready');
    } catch (error) {
      if (currentCliSessionId.current === nextSessionId) setCliStatus('missing');
      throw error;
    }
  }

  /** Atualiza o painel compacto após operações que consomem o CLI. */
  function refreshQuota() {
    setQuotaRefreshKey(previousKey => previousKey + 1);
  }

  function openCliSettings() {
    setDraftCliConfig(cliConfig);
    setIsSettingsDialogOpen(true);
  }

  function saveCliSettings() {
    const normalizedConfig = {
      program: draftCliConfig.program.trim() || 'auto',
      args: draftCliConfig.args.trim(),
    };
    saveCliConfig(normalizedConfig);
    setCliConfig(normalizedConfig);
    setIsSettingsDialogOpen(false);
  }

  /** Seleciona a matéria e a aba inicial, limpando rascunhos de navegação. */
  function openSubject(studySubject: StudySubject, tab: StudyTab = 'chat') {
    subjectManager.resetSubjectDraft();
    setActiveSubjectId(studySubject.id);
    setActiveTab(tab);
    conversation.setDraftMessage('');
  }

  function submitSubjectDraft() {
    const createdSubject = subjectManager.saveSubjectDraft();
    if (createdSubject) {
      const initialTab: StudyTab = createdSubject.sources.some(source => source.kind === 'file') ? 'guide' : 'chat';
      openSubject(createdSubject, initialTab);
    }
  }

  function showSubjectDashboard() {
    setActiveSubjectId(null);
    subjectManager.resetSubjectDraft();
    conversation.setDraftMessage('');
  }

  function beginSubjectEdit(studySubject: StudySubject) {
    showSubjectDashboard();
    subjectManager.editSubjectMaterials(studySubject);
  }

  const screenTitle = activeSubject
    ? activeTab === 'chat' ? 'Conversa de estudo' : activeTab === 'guide' ? 'Guia de estudo' : 'Estudo inteligente'
    : 'Meus assuntos';
  const cliStatusLabel = cliStatus === 'ready' ? isPersistentSession ? `${activeCliName} conectado` : activeCliName
    : cliStatus === 'checking' ? 'Verificando CLI'
      : cliStatus === 'browser' ? 'Prévia no navegador' : 'CLI não encontrado';

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BookOpen size={21} strokeWidth={2.3}/></div><span>acamp<span className="brand-dot">.</span></span></div>
      <button className="new-chat" onClick={showSubjectDashboard}><Plus size={17}/> Meus assuntos</button>
      <div className="side-label">ASSUNTO ATUAL</div>
      {activeSubject && <div className="side-subject">{activeSubject.name}</div>}
      {activeSubject && <button className={`side-item ${activeTab === 'chat' ? 'selected' : ''}`} onClick={() => setActiveTab('chat')}><MessageCircle size={17}/> Conversa de estudo</button>}
      {activeSubject && <button className={`side-item ${activeTab === 'guide' ? 'selected' : ''}`} onClick={() => setActiveTab('guide')}><BookOpenText size={17}/> Guia de estudo</button>}
      {activeSubject && <button className={`side-item ${activeTab === 'smart' ? 'selected' : ''}`} onClick={() => setActiveTab('smart')}><Brain size={17}/> Estudo inteligente</button>}
      <div className="sidebar-bottom"><CliQuota program={cliConfig.program} ready={cliStatus === 'ready'} refreshKey={quotaRefreshKey}/><button className="settings-link" onClick={openCliSettings}><Settings2 size={17}/> Configurar CLI</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="mobile-brand">acamp<span>.</span></div><div className="header-title">{screenTitle} <ChevronDown size={15}/></div><button className={`status ${cliStatus}`} onClick={openCliSettings}><span className="status-dot"/>{cliStatusLabel}</button></header>
      {!activeSubject && <SubjectDashboard
        subjects={subjectManager.subjects}
        formOpen={subjectManager.isSubjectFormOpen}
        editingId={subjectManager.editingSubjectId}
        newName={subjectManager.subjectNameDraft}
        newGoal={subjectManager.subjectGoalDraft}
        newLevel={subjectManager.subjectLevelDraft}
        draftSources={subjectManager.sourceDrafts}
        linkInput={subjectManager.materialLinkDraft}
        sourceError={subjectManager.materialError}
        storageError={subjectManager.storageError}
        readingFile={subjectManager.isReadingFiles}
        preparingQuiz={subjectManager.quizPreparation}
        onOpenForm={() => { subjectManager.resetSubjectDraft(); subjectManager.setIsSubjectFormOpen(true); }}
        onSubmit={submitSubjectDraft}
        onCancelForm={subjectManager.resetSubjectDraft}
        onNameChange={subjectManager.setSubjectNameDraft}
        onGoalChange={subjectManager.setSubjectGoalDraft}
        onLevelChange={subjectManager.setSubjectLevelDraft}
        onAddFiles={subjectManager.addMaterialFiles}
        onLinkChange={subjectManager.setMaterialLinkDraft}
        onAddLink={subjectManager.addMaterialLink}
        onRemoveSource={sourceId => subjectManager.setSourceDrafts(currentSources => currentSources.filter(source => source.id !== sourceId))}
        onEdit={beginSubjectEdit}
        onDelete={studySubject => { subjectManager.setSubjectPendingDeletion(studySubject); subjectManager.setDeleteError(''); }}
        onContinue={studySubject => openSubject(studySubject)}
      />}
      <div className="guide-tab-shell" hidden={!activeSubject || activeTab !== 'guide'}>{activeSubject && <StudyGuide
        key={activeSubject.id} subject={activeSubject} enabled={activeTab === 'guide'} config={cliConfig} isTauri={isTauriRuntime}
        onGuide={guide => subjectManager.updateSubject(activeSubject.id, { guide })}
        onAttempt={sourceId => subjectManager.updateSubject(activeSubject.id, { guideAttemptedSourceId: sourceId })}
        onActivity={refreshQuota} onMaterials={() => beginSubjectEdit(activeSubject)}
      />}</div>
      {activeSubject && activeTab === 'smart' && <SmartStudy
        key={activeSubject.id} subject={activeSubject} config={cliConfig} isTauri={isTauriRuntime}
        onMaterials={() => beginSubjectEdit(activeSubject)} onActivity={refreshQuota}
      />}
      {activeSubject && activeTab === 'chat' && <StudyConversation
        subject={activeSubject} messages={conversation.conversationMessages} inputText={conversation.draftMessage}
        waitingForReply={conversation.isWaitingForReply} streamingReply={conversation.streamingReply} cliProgressSteps={conversation.cliProgressSteps} bottomRef={conversation.latestMessageRef}
        onInputChange={conversation.setDraftMessage} onSend={conversation.sendMessage}
        onSubjectUpdate={changes => subjectManager.updateSubject(activeSubject.id, changes)}
        onSwitchSubject={showSubjectDashboard}
      />}
    </main>
    <AppDialogs
      deletingSubject={subjectManager.subjectPendingDeletion} deleting={subjectManager.isDeletingSubject}
      deleteError={subjectManager.deleteError} settingsOpen={isSettingsDialogOpen} draftConfig={draftCliConfig}
      onCloseDelete={() => subjectManager.setSubjectPendingDeletion(null)}
      onDeleteSubject={subjectManager.deleteSelectedSubject} onDraftConfigChange={setDraftCliConfig}
      onCloseSettings={() => setIsSettingsDialogOpen(false)} onSaveSettings={saveCliSettings}
    />
  </div>;
}
