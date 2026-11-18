# Tecnologias, arquitetura e abordagem

## Tecnologias em uso

| Camada | Tecnologia | Função |
| --- | --- | --- |
| Aplicativo desktop | Tauri 2 | Janela nativa e ponte segura entre interface e backend. |
| Interface | React 19 + TypeScript | Tela de assuntos, conversa, guia e configurações. |
| Desenvolvimento e build da interface | Vite 6 | Servidor de desenvolvimento e empacotamento web. |
| Ícones | lucide-react | Ícones da interface. |
| Backend local | Rust + Tauri commands | Detectar e executar o CLI, coletar saída e reportar erros. |
| IA na versão inicial | `agy` ou `gemini` CLI | Responder à conversa usando o comando instalado no PC. |
| Leitura de PDF | pdfjs-dist | Extrair texto e referências de página na interface. |
| Leitura de DOCX | mammoth | Extrair parágrafos do documento. |
| Exibição de respostas e do guia | react-markdown | Renderizar Markdown do CLI como elementos React, com HTML bruto tratado como texto. |
| Chave do cache de guias | sha2 (SHA-256) | Identificar o mesmo nome e conteúdo de arquivo entre aberturas. |
| Dados de cota do CLI | serde_json | Ler a resposta estruturada de `/usage` do agy. |
| Rodadas adaptativas | Rust + serde_json | Gerar e validar questões, registrar respostas e persistir histórico por assunto. |

As versões acima representam as faixas principais declaradas em `package.json` e `src-tauri/Cargo.toml`. Os arquivos de lock registram as versões resolvidas.

## Organização do código

O frontend mantém `src/App.tsx` como compositor de navegação e telas. `src/useStudySubjects.ts` gerencia o estado e as operações das matérias; `src/useStudyConversation.ts` gerencia o fluxo de mensagens. A lista e o formulário ficam em `src/SubjectDashboard.tsx`; a conversa visual fica em `src/StudyConversation.tsx`; exclusão e configuração aparecem em `src/AppDialogs.tsx`. A integração de conversa fica em `src/conversation.ts`, configuração local em `src/cliConfig.ts`, tipos e persistência de matérias em `src/studySubjects.ts` e leitura de arquivos em `src/studyFile.ts`. Guia, estudo inteligente e cotas mantêm componentes dedicados. O backend divide comandos em `src-tauri/src/cli.rs`, `guide.rs`, `quota.rs` e `quiz.rs`; `lib.rs` registra os módulos e inicializa o Tauri.

Essa organização está em refatoração contínua. Veja [refatoração e clean code](refatoracao.md) para o estado e os próximos módulos a extrair.

## Fluxo implementado

```text
React (src/App.tsx + hooks e componentes do recurso)
  → inicialização: invoke(start_cli_session) quando o app abre ou a configuração muda
  → mensagens: invoke(run_cli_stream) na sessão persistente do agy
  → Rust (src-tauri/src/cli.rs; comandos registrados em lib.rs)
  → agy instalado no computador (--input-format/--output-format stream-json)
  → Channel Tauri: eventos de texto e etapas observadas; stdin permanece aberto
  → resposta incremental e atividade do CLI no chat
```

O frontend não chama o CLI diretamente. Ao abrir ou reconfigurar o app, o backend inicia o `agy` em modo de entrada e saída JSONL e mantém o processo vivo. Cada mensagem é enviada como um evento pelo mesmo `stdin`; o processo conserva o histórico e o backend envia o histórico salvo apenas quando a sessão entra em uma matéria ou quando o contexto/material muda. O Channel Tauri encaminha deltas de resposta, mudanças de etapa e operações de ferramenta à interface. O backend encerra o processo na saída do Tauri. O Gemini CLI oficial ainda não documenta o protocolo persistente; nesse caso o app mantém o modo anterior de uma execução por mensagem. Os detalhes exibidos dependem do que a versão instalada do CLI reporta; o ACAMP não expõe raciocínio interno que o CLI não fornece. A configuração, os assuntos e as conversas são guardados no `localStorage`; não há servidor central, banco de dados ou conta ACAMP nesta versão. A seleção do assunto é feita a cada abertura do aplicativo.

Os arquivos cadastrados no assunto são processados com o mesmo extrator local do guia e seu texto é armazenado junto ao assunto. O comando `run_cli` recebe trechos limitados desse texto e os links cadastrados. O link por si só não é tratado como conteúdo lido. O limite de trechos reduz o tamanho do prompt, mas significa que um arquivo longo não é integralmente consultado no chat.

O componente de conversa usa o mesmo renderizador para a resposta incremental e a mensagem final, inclusive mensagens carregadas do histórico. O texto original do CLI é armazenado e reaproveitado no contexto. A renderização exibe links como texto copiável após o filtro de URL da biblioteca e mostra o texto alternativo de imagens sem buscar recursos externos.

Comandos de barra iniciados por `/` passam ao CLI sem o texto de contexto padrão. Consultas internas que o `agy` não aceita no protocolo `stream-json` rodam em modo headless separado; skills e comandos personalizados compatíveis podem permanecer na sessão. O módulo `src/cliCommands.ts` intercepta `/clear` e `/compact`: limpar apaga histórico e resumo local e abre um novo processo `agy`; compactar solicita ao processo atual um resumo da conversa, salva-o na matéria e reinicia o `agy`. Na próxima mensagem, o backend injeta o resumo no processo novo em vez de repetir o histórico. No modo não persistente, o resumo substitui o histórico no prompt de cada mensagem. O histórico original permanece no armazenamento local e na interface até `/clear`.

O comando `get_cli_usage` é independente das conversas. Para `agy`, consulta `/usage` em JSON e retorna apenas os dados necessários ao painel. Para `gemini`, retorna estado indisponível, pois o comando documentado de cota é interativo. Veja [limites da IA](limites-cli.md).

## Fluxo de guia por arquivo implementado

```text
Arquivo cadastrado no assunto → extração local no frontend → texto com referências
       → comando Tauri generate_study_guide
       → buscar guia em disco por hash
          ↳ se existir: devolver sem CLI
          ↳ se não existir: notas por partes no CLI → síntese → salvar em disco
       → Markdown associado ao assunto e mostrado na aba
```

A extração ocorre na interface; o texto é passado ao backend Rust e ao CLI configurado apenas quando não há guia salvo. A geração começa ao abrir a aba após cadastrar o assunto com arquivo, priorizando PDF, e a aba não solicita outro arquivo. O cache fica na pasta de dados do aplicativo, em `guides/<sha256>.md`, e a gravação usa arquivo temporário seguido de renomeação. PDFs em imagem não são interpretados. O prompt trata o conteúdo do arquivo como dados, pede referências e separa complementos externos.

## Fluxo de estudo inteligente implementado

```text
Salvar assunto com arquivo → tarefa em segundo plano → CLI gera seis questões em JSON
                       → Rust valida e salva rodada
Abrir aba → carregar rodada existente → aluno escolhe opção
                                   → Rust registra resposta e devolve feedback
Última resposta → resultado → CLI gera nova rodada
                           → quatro questões de tópicos com erros, duas de revisão
```

O módulo `src-tauri/src/quiz.rs` guarda as rodadas em `quizzes/<id-do-assunto>.json` na pasta de dados do aplicativo. Ao salvar um assunto com arquivo, o frontend inicia `start_quiz_round` com a opção `onlyFirst`; o backend devolve a rodada existente sem chamar a IA se alguma já tiver sido criada. A interface recebe somente a questão corrente e suas opções antes da resposta. O índice correto e as explicações são devolvidos depois que o backend grava a escolha. A chamada de geração é serializada para não criar duas rodadas simultâneas para o mesmo estado.

O comando `delete_subject_data` remove o histórico de questões e, quando não é compartilhado por outro assunto, o cache do guia atual. Ele usa as travas de quiz e guia para aguardar gerações em andamento antes da limpeza. Após o comando terminar, o frontend remove o assunto e sua conversa do `localStorage`; uma falha no backend mantém o assunto na interface para permitir nova tentativa.

## Abordagem para vídeos, ainda planejada

```text
Link → validar vídeo → tentar legenda
                         ↓ sem legenda
                   serviço no PC com GPU → baixar áudio → faster-whisper
                         ↓
              segmentos com texto e horários
                         ↓
       prompts padronizados → assuntos e materiais de estudo
```

O primeiro cenário remoto será entre dois computadores por uma rede privada, proposta com Tailscale. A conexão, o serviço e as bibliotecas de vídeo ainda não foram adicionados ao ACAMP atual. O processamento de IA via Gemini API não é requisito da arquitetura básica, pois tem credenciais e cobrança separadas.

## Regras de implementação discutidas

- Identificar a origem de cada conteúdo para não apresentar inferência por metadados como análise do vídeo.
- Reaproveitar componentes existentes dos projetos anteriores após adaptação ao novo aplicativo, sem depender de caminhos absolutos na versão distribuída.
- Devolver progresso e erros compreensíveis ao aluno durante operações demoradas.
- Manter o processamento pesado fora do PC do aluno quando ele não tiver hardware adequado.

Detalhes das funcionalidades estão em [funcionalidades](funcionalidades.md); a organização dos arquivos está em [estrutura](estrutura.md).
