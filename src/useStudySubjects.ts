import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { loadSubjects, saveSubjects, type Message, type StudySubject, type SubjectSource } from './studySubjects';
import { readStudyFile } from './studyFile';
import type { StudyCliConfig } from './conversation';

const isTauriRuntime = '__TAURI_INTERNALS__' in window;

/** Gerencia matérias, materiais locais, persistência e rodadas iniciais de quiz. */
export function useStudySubjects(cliConfig: StudyCliConfig, onAiActivity: () => void) {
  const [subjects, setSubjects] = useState<StudySubject[]>(loadSubjects);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectNameDraft, setSubjectNameDraft] = useState('');
  const [subjectGoalDraft, setSubjectGoalDraft] = useState('');
  const [subjectLevelDraft, setSubjectLevelDraft] = useState<StudySubject['level']>('Iniciante');
  const [sourceDrafts, setSourceDrafts] = useState<SubjectSource[]>([]);
  const [materialLinkDraft, setMaterialLinkDraft] = useState('');
  const [materialError, setMaterialError] = useState('');
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [subjectPendingDeletion, setSubjectPendingDeletion] = useState<StudySubject | null>(null);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [quizPreparation, setQuizPreparation] = useState<Record<string, 'preparing' | 'ready' | 'error'>>({});

  useEffect(() => {
    try {
      saveSubjects(subjects);
      setStorageError('');
    } catch {
      setStorageError('Não foi possível salvar os assuntos neste computador. Remova materiais grandes ou libere espaço antes de fechar o aplicativo.');
    }
  }, [subjects]);

  function updateSubject(subjectId: string, subjectChanges: Partial<StudySubject>) {
    setSubjects(currentSubjects => currentSubjects.map(studySubject => studySubject.id === subjectId
      ? { ...studySubject, ...subjectChanges, updatedAt: Date.now() }
      : studySubject));
  }

  function appendSubjectMessage(subjectId: string, message: Message) {
    setSubjects(currentSubjects => currentSubjects.map(studySubject => studySubject.id === subjectId
      ? { ...studySubject, messages: [...studySubject.messages, message], updatedAt: Date.now() }
      : studySubject));
  }

  function resetSubjectDraft() {
    setSubjectNameDraft('');
    setSubjectGoalDraft('');
    setSubjectLevelDraft('Iniciante');
    setSourceDrafts([]);
    setMaterialLinkDraft('');
    setMaterialError('');
    setEditingSubjectId(null);
    setIsSubjectFormOpen(false);
  }

  async function prepareFirstQuizRound(studySubject: StudySubject) {
    if (!isTauriRuntime || !studySubject.sources.some(source => source.kind === 'file')) return;
    setQuizPreparation(previousStates => ({ ...previousStates, [studySubject.id]: 'preparing' }));
    try {
      await invoke('start_quiz_round', {
        subjectId: studySubject.id,
        subjectName: studySubject.name,
        guide: studySubject.guide?.text || null,
        sources: studySubject.sources,
        program: cliConfig.program,
        args: cliConfig.args,
        onlyFirst: true,
      });
      setQuizPreparation(previousStates => ({ ...previousStates, [studySubject.id]: 'ready' }));
    } catch {
      setQuizPreparation(previousStates => ({ ...previousStates, [studySubject.id]: 'error' }));
    } finally {
      onAiActivity();
    }
  }

  function saveSubjectDraft() {
    const normalizedSubjectName = subjectNameDraft.trim();
    if (!normalizedSubjectName) return;
    if (!editingSubjectId && sourceDrafts.length === 0) {
      setMaterialError('Adicione pelo menos um arquivo ou link para orientar o estudo.');
      return;
    }

    if (editingSubjectId) {
      const previousSubject = subjects.find(studySubject => studySubject.id === editingSubjectId);
      const updatedDetails = {
        name: normalizedSubjectName,
        goal: subjectGoalDraft.trim(),
        level: subjectLevelDraft,
        sources: sourceDrafts,
      };
      updateSubject(editingSubjectId, updatedDetails);
      if (previousSubject) void prepareFirstQuizRound({ ...previousSubject, ...updatedDetails });
      resetSubjectDraft();
      return;
    }

    const newStudySubject: StudySubject = {
      id: crypto.randomUUID(),
      name: normalizedSubjectName,
      goal: subjectGoalDraft.trim(),
      stage: 'Explorando o assunto',
      level: subjectLevelDraft,
      messages: [],
      sources: sourceDrafts,
      updatedAt: Date.now(),
    };
    setSubjects(currentSubjects => [newStudySubject, ...currentSubjects]);
    void prepareFirstQuizRound(newStudySubject);
    resetSubjectDraft();
    return newStudySubject;
  }

  function editSubjectMaterials(studySubject: StudySubject) {
    setIsSubjectFormOpen(true);
    setEditingSubjectId(studySubject.id);
    setSubjectNameDraft(studySubject.name);
    setSubjectGoalDraft(studySubject.goal);
    setSubjectLevelDraft(studySubject.level);
    setSourceDrafts(studySubject.sources);
    setMaterialError('');
  }

  function addMaterialLink() {
    try {
      const validatedUrl = new URL(materialLinkDraft.trim());
      if (!['http:', 'https:'].includes(validatedUrl.protocol)) throw new Error();
      if (sourceDrafts.some(source => source.url === validatedUrl.href)) {
        setMaterialError('Este link já foi adicionado.');
        return;
      }
      setSourceDrafts(currentSources => [...currentSources, {
        id: crypto.randomUUID(), kind: 'link', name: validatedUrl.hostname + validatedUrl.pathname, url: validatedUrl.href, text: '',
      }]);
      setMaterialLinkDraft('');
      setMaterialError('');
    } catch {
      setMaterialError('Digite um link HTTP ou HTTPS válido.');
    }
  }

  async function addMaterialFiles(selectedFiles: FileList | null) {
    if (!selectedFiles?.length) return;
    setIsReadingFiles(true);
    setMaterialError('');
    try {
      const extractedSources: SubjectSource[] = [];
      for (const selectedFile of Array.from(selectedFiles)) {
        const extractedFile = await readStudyFile(selectedFile);
        extractedSources.push({ id: crypto.randomUUID(), kind: 'file', name: extractedFile.name, text: extractedFile.text });
      }
      setSourceDrafts(currentSources => [...currentSources, ...extractedSources]);
    } catch (error) {
      setMaterialError(String(error));
    } finally {
      setIsReadingFiles(false);
    }
  }

  async function deleteSelectedSubject() {
    if (!subjectPendingDeletion || isDeletingSubject) return;
    const selectedSubject = subjectPendingDeletion;
    const guideSource = selectedSubject.sources.find(source => source.kind === 'file' && source.name.toLowerCase().endsWith('.pdf'))
      ?? selectedSubject.sources.find(source => source.kind === 'file');
    const guideIsShared = !!guideSource && subjects.some(studySubject => studySubject.id !== selectedSubject.id
      && studySubject.sources.some(source => source.kind === 'file' && source.name === guideSource.name && source.text === guideSource.text));
    setIsDeletingSubject(true);
    setDeleteError('');
    try {
      if (isTauriRuntime) await invoke('delete_subject_data', {
        subjectId: selectedSubject.id,
        guideFileName: guideSource?.name ?? null,
        guideContent: guideSource?.text ?? null,
        deleteGuideCache: !guideIsShared,
      });
      setSubjects(currentSubjects => currentSubjects.filter(studySubject => studySubject.id !== selectedSubject.id));
      if (editingSubjectId === selectedSubject.id) resetSubjectDraft();
      setQuizPreparation(previousStates => {
        const updatedStates = { ...previousStates };
        delete updatedStates[selectedSubject.id];
        return updatedStates;
      });
      setSubjectPendingDeletion(null);
    } catch (error) {
      setDeleteError(String(error));
    } finally {
      setIsDeletingSubject(false);
    }
  }

  return {
    subjects, setSubjects, updateSubject, appendSubjectMessage,
    editingSubjectId, subjectNameDraft, setSubjectNameDraft, subjectGoalDraft, setSubjectGoalDraft,
    subjectLevelDraft, setSubjectLevelDraft, sourceDrafts, setSourceDrafts, materialLinkDraft, setMaterialLinkDraft,
    materialError, storageError, isReadingFiles, isSubjectFormOpen, setIsSubjectFormOpen, quizPreparation,
    subjectPendingDeletion, setSubjectPendingDeletion, isDeletingSubject, deleteError, setDeleteError,
    resetSubjectDraft, saveSubjectDraft, editSubjectMaterials, addMaterialLink, addMaterialFiles, deleteSelectedSubject,
  };
}
