# ACAMP

Primeira versão de teste do aplicativo de estudos, feita com Tauri 2, React e TypeScript.

## Executar

```powershell
npm install
npm run tauri dev
```

`npm run dev` abre apenas uma prévia da interface no navegador. A execução do CLI funciona no aplicativo Tauri.

## Conectar um CLI

Por padrão, o ACAMP procura `agy` e, se não encontrá-lo, tenta `gemini`. Usa `agy --print` ou `gemini --prompt` para enviar a conversa. Abra **Configurar CLI** para escolher um deles ou informar um caminho completo.

Argumentos personalizados são opcionais. O marcador `{prompt}` é substituído pelo texto da conversa. Se o marcador não estiver nos argumentos, o texto é enviado pela entrada padrão do processo. O ACAMP exibe a saída padrão como resposta e a saída de erro quando o comando falha.

Nesta máquina, `agy` e `gemini` foram encontrados. Uma chamada curta com `agy --print` retornou uma resposta corretamente.
