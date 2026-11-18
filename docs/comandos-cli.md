# Comandos do CLI no chat

## Implementado

O chat reconhece comandos locais do ACAMP e encaminha os demais comandos iniciados por `/` diretamente ao CLI, sem adicionar contexto de matéria ou o rótulo `Aluno:`. Digite `/help` para consultar a lista da versão instalada. A lista pode variar conforme a versão e as extensões configuradas.

### Comandos próprios do ACAMP

| Comando | Comportamento |
| --- | --- |
| `/clear` | Apaga o histórico e o resumo da conversa da matéria e reinicia a sessão persistente do `agy`. Mantém os materiais, guia, questões e demais dados da matéria. |
| `/compact` | Solicita um resumo da conversa ao agente, preserva o histórico completo visível e salvo localmente e abre uma sessão nova que recebe o resumo como contexto. A chamada de resumo consome uso do CLI. Pode receber uma orientação opcional após o comando. |

No modo não persistente, `/clear` remove o histórico que seria incluído na próxima chamada, e `/compact` faz o resumo substituir as mensagens antigas no prompt.

### Comandos encaminhados ao CLI

Todos os outros comandos que começam por `/` são enviados sem o contexto do ACAMP. Os comandos informativos padrão conhecidos são executados como uma chamada headless separada, pois o `agy` recusa `/help` e outros comandos internos dentro da sessão `stream-json`. Os demais comandos seguem pela sessão persistente, o que permite a resolução de skills e comandos personalizados quando suportada pela versão instalada.

No `agy` instalado durante a implementação (1.5.10), `/help` listou comandos como `/agents`, `/changelog`, `/config`, `/credits`, `/effort`, `/hooks`, `/model`, `/permissions`, `/plugin`, `/skills` e `/usage`. O próprio CLI decide quais são compatíveis com o modo programático. Comandos que dependem de interface interativa podem retornar uma mensagem de incompatibilidade. `/help` apresenta a lista efetiva para cada versão. Consultas informativas não consomem uso de modelo; `/compact` usa o agente para produzir o resumo.

## Distinção importante

Comandos de barra são ações invocadas pelo usuário no chat. Hooks do agente são callbacks de ciclo de vida (por exemplo, antes ou depois de uma ferramenta); eles não são comandos digitados no chat. O ACAMP não altera as configurações nem instala hooks do `agy`.

## Limites e próximos passos

- O suporte depende dos comandos reconhecidos pelo CLI configurado e pela versão instalada.
- O Gemini CLI pode não reconhecer os comandos próprios do `agy`; `/clear` e `/compact` são tratados pelo ACAMP, e os demais são encaminhados ao Gemini sem garantia de compatibilidade.
- Sugestões e autocompletar de comandos na caixa de mensagem ainda estão planejados.
