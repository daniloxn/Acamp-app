# Estudo inteligente

## Objetivo

O aluno pratica o conteúdo de um assunto em rodadas de múltipla escolha. Cada resposta gera feedback e orienta as próximas questões. A prática usa arquivos cadastrados no assunto; links ainda não fornecem conteúdo extraído.

## Implementado

- Aba **Estudo inteligente** dentro de cada assunto. Ao salvar um assunto com arquivo, o ACAMP começa a gerar a primeira rodada em segundo plano, com seis questões de quatro opções cada. Ao abrir a aba, o aluno encontra as questões já salvas quando a preparação terminou.
- A lista de assuntos indica quando as questões estão sendo preparadas, prontas ou pendentes após falha. Assuntos antigos sem rodada e falhas de preparação oferecem uma ação manual para tentar novamente.
- A IA recebe trechos dos arquivos e, quando disponível, a parte do guia anterior à seção de complementos externos. O prompt pede apenas fatos do material, uma resposta correta, explicação da resposta correta e explicação específica para cada opção incorreta.
- O backend valida o JSON gerado, a quantidade de questões e opções e a presença das explicações antes de salvar a rodada.
- Cada escolha é registrada imediatamente no backend Rust, no arquivo de dados do aplicativo `quizzes/<id-do-assunto>.json`. Reabrir a aba recupera a questão atual e o feedback já dado.
- Ao apagar um assunto pela lista, o arquivo de histórico de questões correspondente também é removido.
- Ao errar, o aluno vê por que sua opção está incorreta e por que a correta está certa. Ao acertar, vê a explicação da correta.
- Após a sexta questão, a interface mostra o resultado e o estado de geração da próxima rodada. O backend resume os tópicos com erros anteriores e exige que as quatro primeiras questões novas sejam desses tópicos; as duas restantes revisam outros conceitos. Se não há erros, a rodada revisa conceitos do material sem essa concentração.
- A interface nunca recebe o índice correto ou as explicações antes de registrar a resposta. Uma resposta repetida à mesma questão não altera o registro.
- A preparação inicial usa uma proteção no backend: se já existe qualquer rodada para o assunto, salvar ou editar seus materiais não dispara outra primeira rodada.

## Limites atuais

- O texto enviado à geração é limitado a até 7 mil caracteres do guia e 11 mil caracteres dos arquivos. Ainda não há busca por trechos relevantes em documentos longos.
- O nome dos tópicos e o conteúdo das questões vêm da IA. O backend valida a distribuição dos tópicos fracos, mas ainda não comprova automaticamente cada afirmação ou referência contra o arquivo.
- Se a IA não devolver o formato ou a distribuição exigidos, a rodada não é salva e o aluno pode tentar novamente. Uma nova tentativa pode consumir outra chamada ao CLI.
- Se o aluno abrir a aba enquanto a preparação em segundo plano ainda está em andamento, a aba aguarda o resultado antes de mostrar as questões.
- O histórico é local ao computador e não sincroniza entre dispositivos.
- O nível declarado do assunto ainda não é atualizado automaticamente pela pontuação; isso precisará de critérios e confirmação do aluno.

## Melhorias futuras

- Buscar passagens relevantes em todos os arquivos do assunto e citar trechos verificáveis.
- Permitir escolher tamanho e dificuldade da rodada sem perder a regra adaptativa.
- Exibir evolução por tópico e sugerir atualização do nível de aprendizagem após evidências suficientes.
- Evitar questões muito parecidas entre rodadas com verificação semântica.
