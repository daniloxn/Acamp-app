import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

/** Extrai texto identificável dos formatos aceitos, preservando referências de página/linha. */
export type StudySource = { name: string; text: string; pages?: number; kind: 'PDF' | 'DOCX' | 'Texto' };
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_TEXT = 60000;

/** Valida tamanho e formato antes de extrair texto para os recursos de estudo. */
export async function readStudyFile(file: File): Promise<StudySource> {
  if (file.size > MAX_BYTES) throw new Error('O arquivo ultrapassa 15 MB. Escolha um arquivo menor.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  let text = '';
  let pages: number | undefined;
  let kind: StudySource['kind'];

  if (extension === 'pdf') {
    kind = 'PDF';
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    pages = document.numPages;
    if (pages > 80) throw new Error('O PDF tem mais de 80 páginas. Divida o material em partes menores.');
    for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines = content.items.map(item => 'str' in item ? item.str : '').filter(Boolean);
      text += `[Página ${pageNumber}]\n${lines.join(' ')}\n\n`;
      if (text.length > MAX_TEXT) throw new Error('O texto extraído ultrapassa 60 mil caracteres. Divida o material em partes menores.');
    }
  } else if (extension === 'docx') {
    kind = 'DOCX';
    const { default: mammoth } = await import('mammoth/mammoth.browser');
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    text = result.value.split(/\n\s*\n/).map((paragraph, index) => `[Parágrafo ${index + 1}] ${paragraph.trim()}`).join('\n\n');
  } else if (extension === 'txt' || extension === 'md') {
    kind = 'Texto';
    text = (await file.text()).split(/\r?\n/).map((line, index) => `[Linha ${index + 1}] ${line}`).join('\n');
  } else {
    throw new Error('Formato não aceito. Use PDF, DOCX, TXT ou MD.');
  }

  if (!text.trim() || text.replace(/\[(?:Página|Parágrafo|Linha) \d+\]/g, '').trim().length < 30) {
    throw new Error('Não encontrei texto suficiente no arquivo. PDFs digitalizados precisam de OCR antes de gerar o guia.');
  }
  if (text.length > MAX_TEXT) throw new Error('O texto extraído ultrapassa 60 mil caracteres. Divida o material em partes menores.');
  return { name: file.name, text, pages, kind };
}
