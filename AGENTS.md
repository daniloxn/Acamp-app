# Instrução principal

Antes de trabalhar no ACAMP, consulte `docs/README.md` e os tópicos relacionados. Documente continuamente funcionalidades, arquitetura, frameworks, abordagem, ideias, tarefas, melhorias, alterações e escolhas rejeitadas nos arquivos correspondentes de `docs/`. Sempre que criar, remover ou mudar a função de uma pasta do projeto ou da documentação, atualize o mapa em `docs/estrutura.md` e o índice em `docs/README.md`. Crie novos tópicos quando necessário e mantenha clara a diferença entre implementado, planejado e descartado.

## Clean code e organização do código

- Separe funcionalidades por domínio e responsabilidade em módulos, componentes, hooks e serviços próprios. Evite concentrar regras, estado e interface de várias funcionalidades em um único arquivo.
- Dê nomes específicos e únicos no escopo relevante. Prefira nomes que indiquem o domínio e a finalidade; evite nomes vagos como `data`, `item`, `value`, `handle` ou `temp` quando houver um nome mais descritivo.
- Mantenha funções pequenas, com uma responsabilidade clara, e extraia lógica reutilizável para módulos apropriados.
- Preserve o comportamento e as funcionalidades existentes ao refatorar; registre alterações intencionais na documentação.
- Comente em português cada módulo ou parte relevante para explicar sua responsabilidade e decisões que não sejam óbvias. Comentários devem esclarecer intenção, não repetir literalmente o código.
- Mantenha tipos explícitos nas fronteiras entre interface, domínio e backend e trate erros junto ao fluxo que pode apresentá-los ao usuário.
