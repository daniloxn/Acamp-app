# Estrutura de pastas

Mantenha este mapa atualizado sempre que uma pasta for criada, removida ou mudar de função. Arquivos gerados são identificados para não serem confundidos com código mantido manualmente.

## Pastas do projeto atual

| Pasta | Função | Estado |
| --- | --- | --- |
| `docs/` | Documentação contínua por tópico e índice em `docs/README.md`. | Mantida manualmente |
| `src/` | Interface React/TypeScript com componentes por recurso, serviços de conversa/configuração, persistência de matérias, extração de arquivos e estilos. | Mantida manualmente |
| `src-tauri/` | Projeto Tauri/Rust, configuração, recursos e permissões. | Mantida manualmente |
| `src-tauri/src/` | Composição dos comandos e módulos Rust separados para CLI, guias, cotas e estudo inteligente. | Mantida manualmente |
| `src-tauri/capabilities/` | Permissões da janela Tauri. | Mantida manualmente |
| `src-tauri/icons/` | Ícones do aplicativo. | Mantida manualmente |
| `src-tauri/gen/` | Schemas gerados pelo Tauri. | Gerada |
| `src-tauri/target/` | Compilação do Rust. | Gerada; ignorada pelo Git e pelo Vite |
| `node_modules/` | Dependências JavaScript instaladas. | Gerada; ignorada pelo Git |
| `dist/` | Build da interface. | Gerada; ignorada pelo Git |

Na raiz ficam `AGENTS.md` (instrução de documentação), `README.md` (como executar), `package.json`, locks e arquivos de configuração. Os guias e históricos de estudo são persistidos na pasta de dados do aplicativo fora da árvore do projeto, em `guides/` e `quizzes/`. Ainda não há pastas de serviço remoto ou vídeos processados no projeto; quando forem criadas, registre-as aqui.

## Arquivos dentro de `docs/`

| Arquivo | Assunto |
| --- | --- |
| `README.md` | Índice e regras de navegação. |
| `produto.md` | Visão e escopo do produto. |
| `funcionalidades.md` | Catálogo de funções e estados. |
| `guia-de-estudo.md` | Fluxo de guia por arquivo, limites e melhorias. |
| `estudo-inteligente.md` | Rodadas adaptativas, feedback, armazenamento e limites. |
| `limites-cli.md` | Consulta de cotas do agy e limites do Gemini CLI. |
| `aplicativo.md` | O que já existe e o que foi verificado. |
| `arquitetura.md` | Frameworks, fluxo técnico e abordagem. |
| `estrutura.md` | Este mapa de pastas. |
| `videos-e-transcricao.md` | Fluxo de vídeo e código anterior examinado. |
| `conexao-remota.md` | Proposta de conexão entre PCs. |
| `tarefas.md` | Próximos passos e pontos em aberto. |
| `decisoes.md` | Escolhas mantidas, revertidas e descartadas. |
| `refatoracao.md` | Registro da organização do código e das convenções de clean code. |
| `comandos-cli.md` | Comandos de barra, suporte do modo headless e comportamento no chat ACAMP. |

Os projetos externos consultados estão em `C:\Users\danil\Documents\Acamp` e `C:\Users\danil\Documents\Projeto\transcrever`; eles não fazem parte da árvore deste projeto.

## Módulos principais do aplicativo

| Arquivo | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Compor navegação, hooks e telas. |
| `src/SubjectDashboard.tsx` | Lista e formulário de matérias. |
| `src/StudyConversation.tsx` | Interface do chat e contexto da matéria. |
| `src/study-conversation.css` | Estilos de Markdown nas respostas do chat. |
| `src/AppDialogs.tsx` | Diálogos de exclusão e configuração do CLI. |
| `src/StudyGuide.tsx` | Interface e geração do guia. |
| `src/SmartStudy.tsx` | Interface das rodadas adaptativas. |
| `src/CliQuota.tsx` | Indicador de cotas. |
| `src/useStudySubjects.ts` | Estado e operações das matérias e materiais. |
| `src/useStudyConversation.ts` | Estado e envio da conversa. |
| `src/conversation.ts` | Montagem dos argumentos de conversa para o comando Tauri. |
| `src/cliCommands.ts` | Reconhecimento dos comandos locais `/clear` e `/compact` e criação da instrução de resumo. |
| `src/cliConfig.ts` | Persistência da configuração do CLI. |
| `src/studySubjects.ts` | Tipos e persistência local das matérias. |
| `src/studyFile.ts` | Extração de texto dos arquivos. |
| `src-tauri/src/lib.rs` | Inicialização e registro dos comandos Tauri. |
| `src-tauri/src/cli.rs` | Descoberta e execução do CLI. |
| `src-tauri/src/guide.rs` | Geração, segmentação e cache de guias. |
| `src-tauri/src/quota.rs` | Consulta e normalização das cotas. |
| `src-tauri/src/quiz.rs` | Geração, validação, armazenamento e respostas do estudo inteligente. |
