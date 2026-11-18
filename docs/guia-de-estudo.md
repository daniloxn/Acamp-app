# Guia de estudo a partir de arquivos

## Objetivo

O aluno fornece um material próprio e o ACAMP monta um guia de estudo. O guia usa o conteúdo extraído do arquivo como base e inclui, em uma seção separada, complementos que a IA considera úteis e que não estão claramente no material.

## Implementado

- Aba **Guia de estudo** na navegação do assunto.
- Arquivos PDF, DOCX, TXT e MD são adicionados no cadastro ou na edição do assunto, com limite de 15 MB por arquivo. Não há seletor de arquivo dentro da aba de guia.
- Extração local do texto. PDFs mantêm referências de página; DOCX recebe referências de parágrafo; TXT/MD recebem referências de linha.
- Mensagens para arquivos ilegíveis, grandes ou sem texto suficiente aparecem ao cadastrá-los.
- Backend divide textos de até 60 mil caracteres em partes de até 9 mil caracteres. O CLI (`agy` ou `gemini`) extrai notas por parte e gera um guia final em Markdown.
- O prompt final separa conteúdo do arquivo de **Complementos sugeridos pela IA**, exige rótulo de sugestão externa e proíbe inventar referências.
- Ao criar assunto com arquivo, a geração começa automaticamente. O resultado é exibido e persistido no próprio assunto. O primeiro PDF tem prioridade; sem PDF, é usado o primeiro arquivo de outro formato.
- O backend calcula uma chave SHA-256 para nome e conteúdo do arquivo e salva o guia em disco na pasta de dados do aplicativo. Antes de executar o CLI, consulta esse cache. Duas solicitações simultâneas são serializadas para não gerar duas vezes.
- A interface registra a tentativa de geração. Se ela falhar ou for interrompida, uma nova abertura não dispara outra execução automaticamente; o aluno escolhe recuperar o guia salvo ou tentar novamente. Depois de concluído, não há botão de regeneração.

## Limites e decisões

- PDFs digitalizados em imagem precisam de OCR; não há OCR nesta versão.
- O guia fica associado ao assunto no `localStorage` e também é salvo em disco pelo backend. Se a cópia da interface não estiver disponível, uma solicitação de recuperação usa o cache em disco antes de chamar a IA.
- Ao apagar um assunto, o cache do arquivo atualmente selecionado para o guia é removido se nenhum outro assunto usa o mesmo nome e conteúdo. Caches antigos de arquivos que já foram retirados do assunto podem permanecer em disco.
- Cada guia usa um arquivo do assunto. Uma síntese conjunta de múltiplos arquivos ainda não foi implementada.
- O arquivo é lido localmente na interface, mas o texto extraído é enviado ao CLI configurado; o comportamento de rede e privacidade depende desse CLI e de sua conta.
- Materiais acima dos limites devem ser divididos antes da importação. Um fluxo para materiais maiores pode ser adicionado depois.
- As referências são solicitadas ao modelo e devem ser conferidas pelo aluno; o aplicativo ainda não verifica automaticamente se cada citação aparece no texto.

## Melhorias futuras

- OCR para PDF digitalizado.
- Sintetizar múltiplos arquivos do mesmo assunto em um guia único.
- Permitir uma nova versão do guia por escolha explícita do aluno, com instruções como nível de ensino ou tempo disponível, mantendo a versão anterior.
- Validar automaticamente as referências ao arquivo e marcar afirmações sem suporte.
