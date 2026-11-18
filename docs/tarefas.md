# Tarefas futuras

## Vídeos

- [ ] Definir o contrato da tarefa: URL, ID, estados, progresso, erro e resultado segmentado.
- [ ] Adaptar o extrator de legendas do projeto antigo.
- [ ] Implementar download de áudio como fallback quando não houver legendas.
- [ ] Adaptar o motor `faster-whisper` existente para tarefas recebidas pelo serviço.
- [ ] Preservar horários e fonte dos trechos para verificação pelo aluno.

## Conexão e interface

- [ ] Criar o serviço no PC com GPU, com autenticação, limites e armazenamento temporário controlado.
- [ ] Criar no frontend entrada de URL e visualização de progresso, transcrição e falhas.
- [ ] Conectar os PCs pela rede privada e testar o fluxo completo com um vídeo público.

## Materiais de estudo

- [ ] Criar prompts padronizados para extrair assuntos e gerar quiz, testes, provas, planos de estudo e respostas no chat.
- [x] Criar o primeiro prompt padronizado e a aba de guia de estudo a partir de arquivo.
- [ ] Adicionar OCR para PDFs digitalizados e permitir materiais maiores.
- [x] Persistir o guia gerado dentro do assunto.
- [x] Adicionar cache em disco para evitar chamadas repetidas ao CLI ao reabrir um guia.
- [ ] Permitir refinar o guia com instruções do aluno.
- [ ] Verificar automaticamente as referências apresentadas no guia.
- [ ] Gerar um guia unificado a partir de múltiplos arquivos do assunto.
- [x] Criar rodadas adaptativas de múltipla escolha, feedback de erro e registro de respostas no backend.
- [ ] Verificar automaticamente se enunciados, alternativas e referências das questões são sustentados pelo material.
- [ ] Buscar trechos relevantes em materiais longos para gerar questões de todo o conteúdo.
- [ ] Mostrar evolução por tópico e reduzir repetição semântica entre rodadas.

## Acompanhamento do aluno

- [x] Abrir em uma lista de assuntos e separar conversas por assunto.
- [x] Enviar assunto, objetivo, etapa e nível declarados ao chat.
- [ ] Propor atualização de etapa e nível com base em atividades avaliativas, sempre com confirmação do aluno.
- [x] Permitir excluir assuntos com confirmação e limpar seu histórico de questões e cache de guia não compartilhado.
- [ ] Permitir editar o objetivo e arquivar assuntos.
- [ ] Planejar armazenamento mais robusto e exportação dos dados locais.
- [x] Permitir arquivos e links no cadastro e na edição do assunto.
- [ ] Extrair conteúdo de links quando houver um mecanismo apropriado para páginas e vídeos, identificando a origem real do texto.
- [ ] Implementar busca por trechos relevantes em arquivos longos, em vez do limite inicial de texto por arquivo.

## Limites da IA

- [x] Mostrar cotas reais do `agy` durante o uso do aplicativo, sem gastar uma chamada de IA na consulta.
- [ ] Investigar uma interface não interativa oficial para a cota total do Gemini CLI, caso seja disponibilizada.
- [ ] Reavaliar suporte de sessão persistente no Gemini CLI; até lá, o modo Gemini mantém uma execução por mensagem.

## Comandos do agente

- [x] Encaminhar comandos de barra ao CLI sem o contexto automático do ACAMP e consultar `/help` da versão instalada.
- [x] Implementar `/clear` para apagar a conversa da matéria e reiniciar o contexto do agente.
- [x] Implementar `/compact` para resumir o contexto, manter o histórico visível e continuar em uma nova sessão.
- [ ] Adicionar sugestões/autocompletar comandos e distinguir na interface comandos interativos incompatíveis com o modo headless.

## Decisões em aberto

- Como distribuir e iniciar o serviço no PC com GPU.
- Qual autenticação e emparelhamento serão mais simples para os dois usuários.
- Qual ferramenta baixará o áudio e como tratará falhas e restrições.
- Qual modelo Whisper padrão e limite de duração funcionam melhor na RTX 5050 disponível.
