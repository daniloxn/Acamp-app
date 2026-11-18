# Decisões e caminhos descartados

Este arquivo registra escolhas e seus motivos para evitar repetir soluções que não atenderam ao projeto. Acrescente novas decisões quando forem tomadas.

## Mantidas

- **Tauri 2 para o aplicativo desktop:** definido pelo usuário desde o início.
- **`agy` como primeira opção, `gemini` como alternativa:** ambos são comandos disponíveis no ambiente do usuário.
- **Legendas antes de transcrição por GPU:** reduz processamento quando o vídeo já oferece texto.
- **Assunto antes do chat:** cada abertura começa pela escolha de um assunto; a conversa e a etapa pertencem a ele. O nível é declarado pelo aluno até haver avaliação real.
- **Arquivo no assunto, não no guia:** o material é cadastrado uma vez no assunto. O guia usa esse arquivo automaticamente e fica salvo no assunto.
- **Guia concluído é reutilizado:** o backend guarda o resultado por hash de nome e conteúdo do arquivo; reabrir o assunto não chama a IA de novo. A regeneração livre foi retirada para evitar custo e alterações involuntárias.
- **Mostrar cota apenas quando houver dados reais:** o indicador usa `/usage` do agy. Para Gemini CLI, informa a indisponibilidade de consulta automática em vez de apresentar uma estimativa como saldo da conta.
- **Correção e histórico do estudo no backend:** a interface não recebe o gabarito antes da resposta. Os erros registrados orientam as quatro primeiras questões da rodada seguinte.
- **Primeira rodada antecipada:** a geração começa ao salvar o conteúdo do assunto e não ao abrir o teste. O backend não repete a preparação se já houver uma rodada, evitando custo desnecessário.
- **Exclusão explícita do assunto:** a lista exige confirmação antes de apagar os dados locais da matéria. O cache de guia permanece quando outro assunto usa o mesmo arquivo e conteúdo.
- **Markdown na apresentação da conversa:** a resposta original continua disponível para histórico e contexto. Links ficam copiáveis sem abrir páginas e imagens são representadas pelo texto alternativo, mantendo a conversa livre de navegação e requisições disparadas pela IA.

## Substituídas ou descartadas

- **Comando padrão `antigravity`:** substituído pela detecção de `agy` e `gemini`.
- **Vite monitorando a pasta de build do Rust:** causou erro `EBUSY` no Windows; `src-tauri/target` passou a ser ignorada.
- **Enviar somente a URL como texto ao CLI e afirmar que o vídeo foi analisado:** isso não garante acesso ao áudio ou à transcrição. Não tratar esse resultado como extração do conteúdo falado.

## Regra para futuras reversões

Ao rejeitar ou reverter uma solução, registre aqui o que foi tentado, por que não serviu e qual caminho a substituiu. Não registre uma proposta como decisão concluída.
