import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ReactMarkdown from 'react-markdown';
import { BookOpenText, FileText, LoaderCircle, Paperclip, Sparkles } from 'lucide-react';
import type { StudySubject } from './studySubjects';

/** Apresenta o guia salvo ou coordena sua geração sob demanda para o arquivo selecionado. */
type CliConfig = { program: string; args: string };
type Props = {
  config: CliConfig;
  isTauri: boolean;
  subject: StudySubject;
  enabled: boolean;
  onGuide: (guide: StudySubject['guide']) => void;
  onAttempt: (sourceId: string) => void;
  onActivity: () => void;
  onMaterials: () => void;
};

export default function StudyGuide({ config, isTauri, subject, enabled, onGuide, onAttempt, onActivity, onMaterials }: Props) {
  const source = subject.sources.find(item => item.kind === 'file' && item.name.toLowerCase().endsWith('.pdf')) ?? subject.sources.find(item => item.kind === 'file');
  const guide = subject.guide && subject.guide.sourceId === source?.id ? subject.guide.text : '';
  const attempted = useRef<string | null>(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  async function generate() {
    if (!source || generating) return;
    if (!isTauri) { setError('Abra o ACAMP pelo aplicativo Tauri para gerar o guia.'); return; }
    onAttempt(source.id);
    setError(''); setGenerating(true);
    try {
      const result = await invoke<string>('generate_study_guide', {
        program: config.program, args: config.args, fileName: source.name, content: source.text,
      });
      if (!result.trim()) throw new Error('O CLI terminou sem devolver um guia. Tente novamente.');
      onGuide({ sourceId: source.id, text: result });
    } catch (cause) { setError(String(cause)); }
    finally { setGenerating(false); onActivity(); }
  }

  useEffect(() => {
    if (enabled && source && !guide && subject.guideAttemptedSourceId !== source.id && attempted.current !== source.id) {
      attempted.current = source.id;
      void generate();
    }
  }, [enabled, source?.id, guide, subject.guideAttemptedSourceId]);

  return <div className="guide-page">
    <div className="guide-heading"><div><h1>Guia de estudo</h1><p>Um roteiro baseado no material cadastrado em {subject.name}.</p></div><div className="guide-heading-icon"><BookOpenText size={26}/></div></div>
    {!source ? <div className="guide-setup"><div className="guide-step-title">Nenhum arquivo neste assunto</div><p className="guide-explainer">Adicione um PDF, DOCX, TXT ou MD aos materiais do assunto para gerar o guia. Links, por enquanto, são apenas referências.</p><button className="generate-button" onClick={onMaterials}><FileText size={18}/> Abrir materiais do assunto</button></div> : <>
      {!guide && <div className="guide-setup"><div className="guide-step-title">Material do assunto</div><div className="selected-file"><div className="file-glyph"><FileText size={22}/></div><div><strong>{source.name}</strong><span>{source.text.length.toLocaleString('pt-BR')} caracteres extraídos</span></div></div><p className="guide-explainer guide-source-note">O ACAMP organiza o conteúdo do arquivo e separa sugestões adicionais da IA. Depois de pronto, o guia fica salvo e é reutilizado.</p>{generating ? <p className="generation-note"><LoaderCircle className="spin" size={17}/> Gerando o guia. Arquivos longos podem exigir várias etapas.</p> : <button className="generate-button" onClick={() => { attempted.current = source.id; void generate(); }}><Sparkles size={18}/> {subject.guideAttemptedSourceId === source.id ? 'Recuperar ou tentar novamente' : 'Gerar guia'}</button>}{error && <div className="guide-error" role="alert">{error}</div>}</div>}
      {guide && <section className="guide-result"><div className="guide-result-bar"><div><span><Paperclip size={15}/> {source.name}</span><h2>Seu guia está pronto</h2></div></div><article className="guide-markdown"><ReactMarkdown>{guide}</ReactMarkdown></article></section>}
    </>}
  </div>;
}
