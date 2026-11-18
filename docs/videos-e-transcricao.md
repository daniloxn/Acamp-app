# Vídeos e transcrição

## Fluxo planejado

1. O aluno cola um link do YouTube no ACAMP.
2. O aplicativo valida o link e tenta obter legendas existentes.
3. Sem legendas acessíveis, encaminha a tarefa para o computador com GPU.
4. Esse computador baixa o áudio, transcreve e devolve texto, idioma e segmentos com horários.
5. O ACAMP usa a transcrição para identificar assuntos e criar materiais de estudo.

## Decisões

- Título e descrição não provam o conteúdo falado. Assuntos extraídos devem se basear em legendas ou transcrição, com referência aos trechos.
- Tentar legendas antes de usar a GPU.
- Não exigir transcrição local no computador do aluno nem Gemini API no fluxo básico; acesso via API pode ter cobrança separada das assinaturas ou dos CLIs.

## Código existente examinado

- `C:\Users\danil\Documents\Acamp\backend\app\services\ingestion\youtube_subtitles.py`: busca legendas manuais e automáticas com `youtube-transcript-api`, priorizando português.
- `C:\Users\danil\Documents\Acamp\backend\app\utils\youtube_parser.py`: extrai e valida o ID do vídeo.
- `C:\Users\danil\Documents\Projeto\transcrever\transcribe_engine.py`: usa `faster-whisper`, detecta CUDA e emite progresso e segmentos com horários como linhas JSON.
- O projeto `transcrever` recebe um arquivo local; ainda não recebe URL nem conecta computadores. Nenhum desses trechos foi copiado para o ACAMP atual.

## Melhorias consideradas

- Cache por vídeo para evitar repetir download e transcrição.
- Entrada manual de transcrição se legendas e processamento remoto falharem.
- Análise direta da URL pela Gemini API apenas como recurso opcional, com credenciais, limites e possível cobrança explicados.
