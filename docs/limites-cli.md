# Indicador de limites da IA

## Implementado

- Um botão compacto na lateral mostra o menor percentual restante quando o `agy` oferece dados. Ao passar o mouse ou clicar, aparecem os detalhes; o clique mantém o painel aberto até ser clicado novamente.
- A consulta do CLI ativo ocorre em segundo plano ao abrir, a cada minuto e após conversas ou tentativas de geração de guia. O botão mantém os últimos dados enquanto uma atualização acontece; não mostra mensagem de carregamento.
- Quando o CLI ativo é `agy`, o backend executa `agy --print /usage --output-format json`. Esse comando de consulta não inicia uma conversa nem consome cota de IA. O painel mostra os percentuais **restantes** por grupo de modelos, as janelas semanal e de cinco horas e as datas de renovação informadas pelo CLI.
- A resposta é lida no backend Rust, que devolve somente nome do grupo, nome da janela, percentual e renovação para a interface.
- Se a consulta falhar, o detalhe expansível mostra o erro e oferece atualização manual. Uma consulta periódica não impede o uso do chat.
- Quando o CLI ativo é `gemini`, o painel informa que a cota total não pode ser consultada automaticamente por este fluxo. O usuário pode verificar `/stats model` no terminal interativo do Gemini CLI.

## Limites

- Os percentuais do `agy` são os valores reportados pelo provedor no instante da consulta; podem incluir uso feito fora do ACAMP e mudar entre atualizações.
- O ACAMP não estima saldo do Gemini nem confunde tokens de uma resposta com a cota total da conta.
- Argumentos personalizados do CLI podem alterar como as conversas são executadas, mas a consulta de cota do `agy` usa o comando oficial separado.

## Fontes oficiais consultadas

- [Antigravity CLI: `/usage`](https://antigravity.google/docs/cli/commands/usage/).
- [Antigravity CLI: modo headless e JSON](https://antigravity.google/docs/cli/headless/).
- [Antigravity: comando `/usage` não interativo](https://antigravity.google/docs/changelog?tab=cli).
- [Gemini CLI: cotas e `/stats model`](https://geminicli.com/docs/resources/quota-and-pricing/).
- [Gemini CLI: saída JSON de sessões headless](https://geminicli.com/docs/cli/headless/).
