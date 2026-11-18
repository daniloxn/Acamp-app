# Aplicativo atual

O código está organizado em componentes e hooks por funcionalidade. A refatoração estrutural foi registrada em [refatoracao.md](refatoracao.md), com responsabilidades por módulo em [estrutura.md](estrutura.md).

## Implementado

- Base desktop com Tauri 2, React e TypeScript.
- Tela de conversa que formata as respostas da IA em Markdown durante a geração e no histórico. Mensagens do aluno, erros e estado de execução do CLI aparecem como texto simples.
- Configuração de executável e argumentos personalizados.
- Detecção automática de `agy` e, caso não esteja disponível, `gemini`. O backend usa `agy --print` ou `gemini --prompt`.
- Vite configurado para ignorar `src-tauri/target` durante o desenvolvimento.
- Aba **Guia de estudo** que usa automaticamente o arquivo cadastrado no assunto e gera o resultado pelo CLI local, sem novo upload na aba.
- Tela inicial de assuntos. Cada assunto tem objetivo, etapa, nível declarado e conversa própria, persistidos no `localStorage`.
- Na tela inicial, o formulário de assunto só aparece após clicar em **Novo assunto** ou **Materiais**; sem assuntos há uma mensagem de estado vazio.
- Cada cartão de assunto permite apagá-lo após confirmação. A operação limpa a matéria e sua conversa do armazenamento local, o histórico de questões no backend e o cache do guia atual quando não é compartilhado.
- O contexto do assunto e até 30 mensagens válidas anteriores entram no prompt quando uma sessão começa ou muda de matéria; mensagens de comando não são repetidas como conteúdo da conversa.
- O chat encaminha comandos de barra do `agy` sem acrescentar o texto de contexto do ACAMP. Consultas que o modo persistente não aceita são executadas isoladamente. `/clear` apaga o histórico da matéria e reinicia a sessão; `/compact` resume o contexto, mantém as mensagens visíveis e inicia uma sessão com o resumo salvo. `/help` consulta os comandos aceitos pela versão instalada.
- Cadastro e edição de materiais por assunto: arquivos extraídos localmente e links de referência. O chat recebe trechos dos arquivos, com limite de 10 mil caracteres por chamada.
- Guia persistido por assunto no `localStorage` e em cache no diretório de dados do aplicativo; a geração inicia ao criar assunto com arquivo e prioriza PDF. A reabertura reutiliza o guia sem executar o CLI novamente.
- Indicador lateral compacto de limites do CLI: menor percentual do `agy` no botão, detalhes ao passar o mouse ou expandir, atualização silenciosa em segundo plano e indicação quando Gemini não oferece consulta automática.
- Aba **Estudo inteligente** com rodadas de seis questões, feedback por alternativa incorreta, registro de respostas no backend e geração adaptativa após a rodada.
- A primeira rodada do estudo inteligente é preparada em segundo plano ao salvar um assunto com arquivo; abrir a aba carrega o resultado salvo.

## Verificações feitas

- Após adicionar os comandos de barra, `npm run build` e `cargo check` passaram. `agy --print /help` retornou a lista sem uso de modelo; também foi confirmado que `/help` não pode ser enviado pela entrada `stream-json`, por isso as consultas internas usam uma execução headless separada. Ainda falta verificar `/clear` e `/compact` pela interface Tauri.

- Frontend e backend passaram nas verificações de compilação.
- Uma chamada curta a `agy --print` retornou resposta.
- O usuário confirmou que `npm run tauri dev` está funcionando.
- Após adicionar o guia por arquivo, `npm run build` e `cargo check` passaram; a aba foi aberta e inspecionada no aplicativo. A geração de um guia completo por um arquivo ainda não foi verificada de ponta a ponta nesta rodada.
- Após adicionar os assuntos, `npm run build` e `cargo check` passaram. O fluxo visual ainda precisa de uma verificação manual no aplicativo.
- Após adicionar materiais aos assuntos, `npm run build` e `cargo check` passaram. O fluxo de cadastro e leitura de arquivos ainda precisa de verificação manual de ponta a ponta.
- Após adicionar o cache de guias, `npm run build`, `cargo check` e `cargo test --lib` passaram. O teste confirma leitura de um guia salvo e mudança da chave quando o conteúdo muda. A geração completa por um PDF real ainda não foi verificada nesta rodada.
- Após adicionar o indicador de cotas, `npm run build` e `cargo test --lib` passaram. Uma consulta local a `agy --print /usage --output-format json` retornou grupos e percentuais sem consumir tokens. O teste do parser confirmou a leitura do percentual restante. A interface ainda precisa de inspeção visual nesta rodada.
- Após adicionar o estudo inteligente, `npm run build` e `cargo test --lib` passaram. Testes cobrem feedback específico, exigência de quatro questões em tópicos fracos e regravação do histórico no Windows. No aplicativo Tauri aberto, a aba foi inspecionada e o `agy` gerou uma primeira rodada real de seis questões a partir do arquivo `tutorial_angular.pdf`. O fluxo completo de seis respostas e a geração adaptativa seguinte ainda não foi verificado visualmente.
- Após antecipar a primeira rodada para o salvamento do assunto, `npm run build` e `cargo test --lib` passaram. Um teste adicional confirma que a preparação inicial reutiliza até uma rodada já concluída. O fluxo de criação de um assunto novo com geração em segundo plano ainda não foi verificado visualmente nesta rodada.
- Após adicionar a exclusão de assuntos, `npm run build` e `cargo test --lib` passaram (7 testes). A janela de confirmação e o cancelamento foram verificados no aplicativo sem apagar assuntos existentes.
- A formatação da conversa foi verificada em Chromium com execução do CLI simulada. A validação cobriu respostas antigas, incrementais e parciais após falha, reabertura do histórico com Markdown original, mensagens e diagnósticos literais, ausência de carregamento de imagens ou navegação por links e exibição em larguras de 375 e 1366 pixels. A aba Guia de estudo também foi reaberta e conferida.

## Limite atual

O aplicativo ainda não extrai conteúdo de links de vídeo, legendas, transcreve áudio ou conecta computadores. O guia de estudo por arquivo ainda não tem OCR nem síntese de múltiplos arquivos.
