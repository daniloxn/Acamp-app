# Conexão entre computadores

## Proposta, ainda não implementada

Usar uma rede privada com Tailscale para o primeiro cenário entre dois computadores. O PC com RTX 5050 executaria um serviço de transcrição; o ACAMP no outro PC enviaria o link, acompanharia a tarefa e receberia a transcrição.

Preferência discutida: o serviço escuta apenas em `127.0.0.1` e é disponibilizado na rede privada por Tailscale Serve. Tailscale ainda não foi configurado e o serviço ainda não existe.

## Requisitos do fluxo

- Mostrar estados como aguardando, baixando, transcrevendo, concluído, falha e servidor indisponível.
- O PC processador precisa estar ligado e conectado. Se estiver indisponível, permitir tentar novamente.
- Aceitar apenas tarefas esperadas, limitar duração e concorrência e não dar acesso genérico ao computador.
- Devolver texto e horários, não o arquivo de vídeo inteiro.

## Melhorias consideradas

- Fila persistente para pedidos feitos enquanto o PC processador estiver desligado.
