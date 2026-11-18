# Funcionalidades do ACAMP

Este catálogo descreve o comportamento pretendido e o estado real de cada recurso. **Implementado** significa que há código no aplicativo atual; **planejado** significa que ainda não há implementação completa. Atualize os estados quando o código mudar.

## Assuntos de estudo e retomada — implementado em versão inicial

- Ao abrir o aplicativo, o aluno vê seus assuntos antes de entrar no chat.
- O formulário de cadastro fica oculto na tela inicial e aparece ao clicar em **Novo assunto**. A edição abre o mesmo formulário pelo botão **Materiais**; ambas as ações podem ser canceladas sem salvar.
- Pode criar um assunto com nome, objetivo opcional e nível declarado (iniciante, intermediário ou avançado).
- Cada assunto guarda a etapa atual e o histórico de conversa separadamente no `localStorage` do computador. A lista ordena os assuntos pela atividade mais recente.
- A lista oferece **Apagar** em cada assunto. Uma confirmação identifica a matéria e avisa que conversa, materiais, guia e histórico de questões serão removidos. Cancelar preserva todos os dados.
- O aluno pode editar a etapa e o nível na tela de conversa. O chat recebe assunto, objetivo, etapa, nível e histórico como contexto.
- No cadastro ou na edição do assunto, pode anexar arquivos PDF, DOCX, TXT e MD e registrar links HTTP/HTTPS. Um assunto novo exige ao menos um material. Os arquivos são extraídos localmente e os trechos de texto entram no contexto do chat. O aluno pode remover materiais na edição.
- Links ficam associados ao assunto como referências, sem extração automática. O prompt proíbe a IA de afirmar que leu o conteúdo do link sem acesso comprovado.
- **Limite do contexto:** cada chamada do chat recebe até 10 mil caracteres dos arquivos, com até 4 mil por arquivo, além dos links. Materiais maiores continuam salvos, mas o chat ainda não faz busca inteligente em todo o conteúdo.
- **Limites atuais:** nível e etapa são informados pelo aluno, sem avaliação automática; armazenamento local ao mesmo perfil do aplicativo, sem sincronização entre computadores. A interface avisa quando o armazenamento local falha.

## Conversa de estudo — implementado em versão inicial

- O aluno escreve uma mensagem e vê a resposta do CLI local.
- As respostas da IA usam Markdown para títulos, ênfase, listas, separadores, citações e código. A formatação aparece durante a geração e ao retomar o histórico. Links são exibidos como referências copiáveis e imagens como texto alternativo.
- Ao abrir o ACAMP, o aplicativo inicia uma sessão persistente do `agy` em segundo plano; as mensagens seguintes usam o mesmo processo e a mesma conversa. O processo é encerrado quando a janela fecha ou quando a configuração do CLI muda.
- Se o aluno escolher o Gemini CLI oficial, que não oferece o protocolo persistente usado pelo ACAMP, o app mantém compatibilidade abrindo uma execução por mensagem e identifica esse modo no indicador de conexão.
- Pode criar um novo assunto, retomar a conversa desse assunto, escolher uma sugestão inicial e enviar com Enter; Shift+Enter cria uma nova linha.
- A tela mostra espera, resposta vazia e erro de execução.
- Comandos iniciados por `/` são encaminhados sem o prefixo de contexto do ACAMP. Consultas informativas como `/help` são executadas em uma chamada headless separada, enquanto skills e comandos personalizados compatíveis podem seguir pela sessão persistente. `/help` mostra a lista suportada pela versão instalada.
- `/clear` remove as mensagens e o resumo da conversa da matéria e reinicia a sessão persistente do agente. `/compact` pede um resumo, mantém as mensagens antigas visíveis e inicia uma sessão usando o resumo como memória; a síntese consome uma chamada do CLI.
- Com resumos compactados, somente o resumo substitui o histórico no contexto enviado ao agente. As mensagens completas continuam salvas localmente e visíveis.
- No Tauri, a resposta do `agy`/`gemini` é enviada ao chat em partes à medida que o CLI as emite; enquanto aguarda, o chat mostra estados e etapas observáveis do processo, incluindo ferramentas quando o CLI as reporta.
- As etapas exibidas vêm dos eventos do CLI (inicialização, resposta, ferramenta, conclusão ou erro). O aplicativo não tenta apresentar raciocínio interno que o CLI não fornece.
- Em uma nova sessão ou mudança de matéria, o histórico válido é enviado no contexto até o limite de 30 mensagens; comandos de barra e erros não entram como mensagens anteriores.
- **Limites atuais:** não há streaming de tokens nem anexos no chat. O histórico é persistido somente no `localStorage` do perfil local.

## Configuração da IA — implementado em versão inicial

- O aplicativo verifica a disponibilidade de um CLI e exibe o estado na interface.
- No modo automático, tenta `agy` e depois `gemini`; aceita caminho de executável e argumentos personalizados.
- Usa `agy --print` ou `gemini --prompt` quando não há argumentos personalizados.
- A configuração é salva no `localStorage` da interface. A chamada ao CLI ocorre no backend Rust do Tauri.
- **Limites atuais:** não há seleção de modelo, gestão de credenciais ou persistência de conversas.

## Indicador de limites da IA — implementado em versão inicial

- Com `agy` ativo, o botão compacto mostra o menor percentual restante; ao passar o mouse ou expandir, mostra as cotas e os horários de renovação reportados por `/usage`. Atualiza em segundo plano e após o uso da IA.
- Com `gemini` ativo, informa que o saldo total não está disponível para consulta automática e orienta a usar `/stats model` no terminal interativo.
- Os números são do CLI/provedor, não uma estimativa feita pelo ACAMP. Veja [detalhes](limites-cli.md).

## Guia de estudo por arquivo — implementado em versão inicial

- O arquivo é cadastrado no assunto. Ao criar um assunto com arquivo, a aba de guia abre e inicia a geração automaticamente, sem uma segunda escolha de arquivo.
- O guia prioriza o primeiro PDF do assunto; caso não exista PDF, usa o primeiro DOCX, TXT ou MD. Um assunto com apenas links mostra instruções para acrescentar um arquivo.
- Gera guia em Markdown com visão geral, tópicos para estudo, roteiro de revisão e perguntas de conferência.
- Inclui uma seção separada de complementos sugeridos pela IA, rotulados como externos ao arquivo.
- Usa referências a páginas, parágrafos ou linhas quando disponíveis no texto extraído.
- O resultado é salvo no assunto e no cache em disco. Ao voltar para a aba, o guia existente é mostrado sem nova chamada à IA. Não há regeneração de um guia concluído; se a geração falhar, a nova tentativa depende de ação do aluno. Se o arquivo usado for removido, um novo guia pode ser gerado para o próximo arquivo selecionado pela regra acima.
- **Limites atuais:** até 15 MB, 80 páginas de PDF e 60 mil caracteres extraídos; PDFs digitalizados precisam de OCR; apenas um arquivo do assunto alimenta cada guia. Veja [detalhes](guia-de-estudo.md).

## Estudo inteligente — implementado em versão inicial

- Cada assunto com arquivo oferece rodadas de seis questões de múltipla escolha, com quatro alternativas. A primeira rodada começa a ser preparada ao salvar o assunto com arquivo, sem esperar o aluno abrir a aba ou clicar para iniciar.
- A lista de assuntos informa o estado temporário da preparação. O backend reutiliza uma primeira rodada já existente quando o assunto é editado.
- O backend registra respostas e acertos, preserva a questão atual e devolve uma explicação específica da opção incorreta e da correta após cada resposta.
- Ao concluir uma rodada, o aplicativo mostra que a IA está gerando novas perguntas. Quando houve erros, quatro das seis questões seguintes são exigidas sobre os tópicos em que o aluno errou; duas revisam outros conceitos.
- Os dados são guardados em arquivos locais do backend, separados por assunto. Veja [detalhes e limites](estudo-inteligente.md).

## Entrada de vídeo do YouTube — planejado

- O aluno informará um link; o aplicativo validará o ID do vídeo.
- A interface deverá mostrar título e origem quando esses dados estiverem disponíveis, sem confundir metadados com conteúdo falado.
- Deverá mostrar origem do texto: legenda, transcrição local/remota ou texto fornecido pelo aluno.

## Obtenção de conteúdo do vídeo — planejado

- Tentar legendas manuais; depois legendas automáticas.
- Quando não houver legendas acessíveis, baixar o áudio e transcrever no PC com GPU.
- Guardar texto, idioma, segmentos e horários para permitir conferência.
- Tratar vídeos indisponíveis, ausência de legenda, falha no download e falha na transcrição.
- Possibilitar entrada manual de transcrição como alternativa futura.

## Processamento remoto — planejado

- O ACAMP em um PC enviará a tarefa de vídeo ao serviço no PC com RTX 5050, via rede privada.
- A interface acompanhará estados de fila, download, transcrição, conclusão e erro.
- Deverá informar quando o PC processador estiver indisponível e permitir tentar novamente.
- O serviço precisará autenticar quem envia tarefas e limitar duração e concorrência.

## Materiais de estudo — planejado

- **Extração de assuntos:** identificar temas e conceitos a partir da transcrição, com referência aos trechos do vídeo.
- **Quiz:** a primeira versão de perguntas adaptativas já está implementada em **Estudo inteligente**; formatos adicionais de quiz ainda podem ser definidos.
- **Testes e provas:** conjuntos de questões para avaliar o aprendizado; formato, correção e pontuação ainda serão definidos.
- **Planos de estudo:** sequência de tópicos e atividades; critérios de duração e acompanhamento ainda serão definidos.
- **Chat sobre o conteúdo:** permitir dúvidas ancoradas no material processado. A conversa genérica já existe, mas ainda não usa uma fonte de vídeo.
- Cada atividade terá prompt padronizado. Formato exato da saída e armazenamento ainda estão em aberto.

## Histórico e reutilização — melhoria futura

- Guardar vídeos processados e materiais gerados para evitar processamento repetido.
- Fila persistente para tarefas pedidas enquanto o PC processador estiver desligado.

Consulte [tarefas](tarefas.md) para os próximos passos e [vídeos e transcrição](videos-e-transcricao.md) para o fluxo de conteúdo.
