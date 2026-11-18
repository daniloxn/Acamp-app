import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ArrowRight, Brain, Check, CircleHelp, FileText, LoaderCircle, Sparkles, X } from 'lucide-react';
import type { StudySubject } from './studySubjects';

/** Coordena a rodada adaptativa, a escolha de respostas e o feedback do backend. */
type CliConfig = { program: string; args: string };
type Question = { id: string; topic: string; prompt: string; options: string[]; reference: string };
type Feedback = { correct: boolean; selectedIndex: number; correctIndex: number; selectedExplanation?: string; correctExplanation: string };
type QuizView = { roundId?: string; roundNumber: number; questionIndex: number; total: number; question?: Question; feedback?: Feedback; finished: boolean; score: number; weakTopics: string[] };
type Props = { subject: StudySubject; config: CliConfig; isTauri: boolean; onMaterials: () => void; onActivity: () => void };

export default function SmartStudy({ subject, config, isTauri, onMaterials, onActivity }: Props) {
  const [view, setView] = useState<QuizView | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const hasFile = subject.sources.some(source => source.kind === 'file');

  useEffect(() => {
    let current = true;
    if (!isTauri) { setLoading(false); return; }
    invoke<QuizView>('load_quiz_state', { subjectId: subject.id }).then(result => {
      if (current) setView(result);
    }).catch(cause => { if (current) setError(String(cause)); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [subject.id, isTauri]);

  async function startRound() {
    if (!isTauri) { setError('Abra o ACAMP pelo aplicativo Tauri para iniciar o estudo.'); return; }
    if (generating) return;
    setGenerating(true); setError('');
    try {
      const result = await invoke<QuizView>('start_quiz_round', {
        subjectId: subject.id, subjectName: subject.name, guide: subject.guide?.text || null,
        sources: subject.sources, program: config.program, args: config.args, onlyFirst: false,
      });
      setView(result);
    } catch (cause) { setError(String(cause)); }
    finally { setGenerating(false); onActivity(); }
  }

  async function answer(index: number) {
    if (!view?.roundId || !view.question || view.feedback || submitting) return;
    setSubmitting(true); setError('');
    try {
      setView(await invoke<QuizView>('answer_quiz_question', {
        subjectId: subject.id, roundId: view.roundId, questionId: view.question.id, selectedIndex: index,
      }));
    } catch (cause) { setError(String(cause)); }
    finally { setSubmitting(false); }
  }

  async function nextQuestion() {
    if (!view?.roundId || !view.feedback || submitting) return;
    setSubmitting(true); setError('');
    try {
      const result = await invoke<QuizView>('advance_quiz_question', { subjectId: subject.id, roundId: view.roundId });
      setView(result);
      if (result.finished) { setSubmitting(false); void startRound(); }
    } catch (cause) { setError(String(cause)); }
    finally { setSubmitting(false); }
  }

  return <div className="smart-page">
    <div className="smart-heading"><span className="eyebrow">PRÁTICA ADAPTATIVA</span><h1>Estudo inteligente</h1><p>Responda, entenda cada erro e pratique mais os conceitos que ainda precisam de atenção.</p></div>
    {loading ? <div className="smart-wait"><LoaderCircle className="spin" size={21}/> Abrindo sua rodada...</div> : !hasFile ? <section className="smart-empty"><FileText size={27}/><h2>Adicione um arquivo para começar</h2><p>As questões usam o conteúdo do material cadastrado no assunto. Links ainda não fornecem texto para essa atividade.</p><button className="primary" onClick={onMaterials}>Abrir materiais</button></section> : !view?.roundId ? <section className="smart-empty"><Brain size={28}/><h2>Questões de {subject.name} ainda não estão prontas</h2><p>O ACAMP normalmente prepara a primeira rodada ao salvar o material. Se a preparação não terminou ou falhou, você pode tentar aqui.</p><button className="primary" disabled={generating} onClick={startRound}>{generating ? <><LoaderCircle className="spin" size={17}/> Criando questões...</> : <><Sparkles size={17}/> Preparar questões agora</>}</button></section> : view.finished ? <section className="smart-finish"><div className="smart-finish-icon"><Check size={26}/></div><span className="eyebrow">RODADA {view.roundNumber} CONCLUÍDA</span><h2>{view.score} de {view.total} acertos</h2>{view.weakTopics.length > 0 ? <p>O ACAMP vai concentrar mais perguntas em: <strong>{view.weakTopics.join(', ')}</strong>.</p> : <p>Você acertou tudo nesta rodada. A próxima trará novas perguntas de revisão.</p>}{generating ? <div className="smart-generating"><LoaderCircle className="spin" size={20}/><div><strong>A IA está gerando mais perguntas</strong><span>{view.weakTopics.length > 0 ? 'Quatro das seis próximas questões vão priorizar os tópicos em que você errou.' : 'A próxima rodada vai revisar outros conceitos do material.'}</span></div></div> : <button className="primary" onClick={startRound}><Sparkles size={17}/> Criar próxima rodada</button>}</section> : view.question ? <section className="smart-card"><div className="smart-progress"><span>Rodada {view.roundNumber} · Questão {view.questionIndex + 1} de {view.total}</span><span>{view.score} acertos</span></div><div className="smart-progress-track"><span style={{ width: `${((view.questionIndex + 1) / view.total) * 100}%` }}/></div><div className="smart-topic"><CircleHelp size={15}/>{view.question.topic}</div><h2>{view.question.prompt}</h2><div className="smart-options">{view.question.options.map((option, index) => {
      const feedback = view.feedback;
      const state = feedback ? index === feedback.correctIndex ? 'correct' : index === feedback.selectedIndex ? 'wrong' : 'muted' : '';
      return <button key={index} type="button" className={`smart-option ${state}`} disabled={!!feedback || submitting} onClick={() => answer(index)}><span className="smart-option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{feedback && index === feedback.correctIndex && <Check size={17}/>} {feedback && !feedback.correct && index === feedback.selectedIndex && <X size={17}/>}</button>;
    })}</div>{view.question.reference && <p className="smart-reference">Referência indicada: {view.question.reference}</p>}{view.feedback && <div className={`smart-feedback ${view.feedback.correct ? 'success' : 'mistake'}`}><strong>{view.feedback.correct ? 'Você acertou!' : 'Ainda não foi dessa vez'}</strong>{!view.feedback.correct && <p><b>Por que sua escolha não está correta:</b> {view.feedback.selectedExplanation}</p>}<p><b>Por que a resposta correta está certa:</b> {view.feedback.correctExplanation}</p></div>}{view.feedback && <button className="smart-next" onClick={nextQuestion} disabled={submitting}>{view.questionIndex + 1 === view.total ? 'Concluir e gerar mais questões' : 'Próxima questão'}<ArrowRight size={17}/></button>}</section> : null}
    {error && <div className="guide-error smart-error" role="alert">{error}</div>}
  </div>;
}
