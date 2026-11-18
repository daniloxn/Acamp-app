/** Tipos compartilhados pelo histórico da conversa e pelos materiais da matéria. */
export type Message = { role: 'user' | 'assistant'; text: string; error?: boolean; command?: boolean };
export type SubjectSource = { id: string; kind: 'file' | 'link'; name: string; text: string; url?: string };
export type StudySubject = {
  id: string;
  name: string;
  goal: string;
  stage: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  messages: Message[];
  conversationSummary?: string;
  sources: SubjectSource[];
  guide?: { sourceId: string; text: string };
  guideAttemptedSourceId?: string;
  updatedAt: number;
};

const SUBJECT_STORAGE_KEY = 'acamp-study-subjects-v1';

/** Recupera matérias válidas do armazenamento local e ignora entradas antigas inválidas. */
export function loadSubjects(): StudySubject[] {
  try {
    const storedValue: unknown = JSON.parse(localStorage.getItem(SUBJECT_STORAGE_KEY) || '[]');
    if (!Array.isArray(storedValue)) return [];
    return storedValue.filter((candidate): candidate is StudySubject =>
      candidate && typeof candidate.id === 'string' && typeof candidate.name === 'string' &&
      typeof candidate.stage === 'string' && typeof candidate.goal === 'string' &&
      ['Iniciante', 'Intermediário', 'Avançado'].includes(candidate.level) && Array.isArray(candidate.messages)
    ).map(studySubject => ({ ...studySubject, sources: Array.isArray(studySubject.sources) ? studySubject.sources : [] }));
  } catch { return []; }
}

/** Persiste o estado inteiro das matérias depois de cada atualização. */
export function saveSubjects(subjects: StudySubject[]) {
  localStorage.setItem(SUBJECT_STORAGE_KEY, JSON.stringify(subjects));
}
