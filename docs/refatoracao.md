# Refatoração e clean code

## Convenções adotadas

- Cada funcionalidade deve ter seus componentes, estado e serviços organizados por responsabilidade, evitando arquivos que concentrem a aplicação inteira.
- O componente raiz coordena telas e estado compartilhado; regras de domínio e acesso ao backend ficam em módulos com finalidade explícita.
- Variáveis e funções devem usar nomes específicos ao domínio. Evitar identificadores vagos quando houver um nome que explique o conteúdo ou a ação.
- Cada módulo e parte relevante deve ter comentários em português que expliquem sua responsabilidade ou decisões não óbvias. Comentários não devem apenas repetir o código.
- Refatorações preservam os fluxos e comportamentos observáveis existentes. Mudanças funcionais devem ser registradas também nos tópicos da funcionalidade.

## Estado

### Implementado

- `src/conversation.ts` concentra a chamada `run_cli`, montagem do contexto da matéria e criação dos objetos de mensagem para sucesso e erro.
- `src/cliConfig.ts` concentra a leitura, normalização e gravação da configuração do CLI.
- `src/SubjectDashboard.tsx` concentra a lista, formulário de criação/edição e ações de matéria; recebe dados e ações por propriedades.
- `src/StudyConversation.tsx` concentra o contexto da conversa, histórico visual, sugestões e compositor de mensagens.
- `src/AppDialogs.tsx` concentra os diálogos de exclusão de matéria e configuração do CLI.
- `src/useStudySubjects.ts` concentra estado, persistência, materiais, criação/edição/exclusão e preparação inicial de questões das matérias.
- `src/useStudyConversation.ts` concentra o envio, estado de espera e rolagem da conversa.
- O fluxo de conversa envia eventos `stream-json` pelo Channel Tauri e renderiza a resposta e as etapas reportadas pelo CLI de forma incremental.
- `src-tauri/src/cli.rs` mantém uma sessão `agy` persistente durante a vida da janela, serializa turnos, e encerra o processo ao fechar/reconfigurar o app.
- `src/studySubjects.ts` concentra tipos e persistência local das matérias.
- `src/studyFile.ts` concentra a extração de texto dos arquivos.
- `src/StudyGuide.tsx`, `src/SmartStudy.tsx` e `src/CliQuota.tsx` concentram suas respectivas telas e comportamentos.
- `src-tauri/src/quiz.rs` concentra persistência, validação e operações do estudo inteligente.
- `src-tauri/src/cli.rs` concentra descoberta do executável, montagem de contexto e execução do `agy`/`gemini`.
- `src-tauri/src/guide.rs` concentra geração, segmentação e cache dos guias.
- `src-tauri/src/quota.rs` concentra consulta e conversão das cotas do CLI.
- `src-tauri/src/lib.rs` registra módulos e comandos Tauri e inicializa o aplicativo.

`src/App.tsx` permanece como compositor e detentor de navegação entre telas e configuração compartilhada do CLI. Ele conecta os hooks e componentes sem implementar as regras detalhadas de matérias, conversa, guias, estudo inteligente ou cotas.

## Histórico

- Início da refatoração: extraído o serviço do fluxo de conversa para `src/conversation.ts`; atualizada a documentação de arquitetura. A interface e os comandos permanecem com os mesmos parâmetros e regras funcionais.
- Extraída a tela de matérias para `src/SubjectDashboard.tsx`. O componente recebe os estados e ações do coordenador e mantém as mesmas validações e ações.
- Extraído o painel da conversa para `src/StudyConversation.tsx`, incluindo contexto editável, sugestões e envio por Enter/Shift+Enter.
- Extraídos os diálogos de exclusão e configuração para `src/AppDialogs.tsx`.
- Extraídos os fluxos de matérias e conversa para `src/useStudySubjects.ts` e `src/useStudyConversation.ts`; `App.tsx` passou a compor os recursos.
- Dividido o backend Rust em `cli.rs`, `guide.rs` e `quota.rs`; `lib.rs` agora registra comandos e módulos, mantendo `quiz.rs` como módulo independente.
