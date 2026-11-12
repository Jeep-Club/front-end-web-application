# Instalação de dependências

## `npm ci` falha por entradas `@emnapi` ausentes

Uma falha como esta pode ocorrer durante a instalação da Vercel:

```text
`npm ci` can only install packages when your package.json and package-lock.json are in sync
Missing: @emnapi/runtime@1.11.3 from lock file
Missing: @emnapi/core@1.11.3 from lock file
Missing: @emnapi/wasi-threads@1.2.3 from lock file
```

Essas dependências podem vir de pacotes WASM opcionais, como o fallback WASI do Tailwind. O lockfile pode não registrar toda a árvore opcional da mesma forma em diferentes versões do npm e sistemas operacionais. Por isso, `npm ci` passar localmente não garante que passe no ambiente de deploy. A Vercel usa a versão do npm que acompanha a versão de Node escolhida para o build; confira ambas no log antes de regenerar o lockfile ([versões na Vercel](https://vercel.com/docs/package-managers)).

## Corrigir e validar

1. Confira `node --version` e `npm --version` localmente e identifique as versões mostradas no log da Vercel.
2. Para o erro de `@emnapi` descrito acima, regenere somente o lockfile com npm 10.9.9:

   ```sh
   npx --yes npm@10.9.9 install --package-lock-only --ignore-scripts
   ```

   Essa versão restaurou as entradas opcionais e empacotadas de `@emnapi` neste projeto. Não use `npm install` com uma versão aleatória do npm: o resultado pode variar e remover entradas necessárias ao deploy.

3. Revise o diff de `package-lock.json`. A correção deve manter `package.json` inalterado e incluir as entradas de `@emnapi` requeridas pela árvore WASM.
4. Valide com uma instalação limpa usando a versão de npm do deploy. `npm ci` remove o `node_modules` da pasta onde é executado; para preservar a instalação local, faça essa validação em uma cópia temporária que contenha `package.json` e `package-lock.json`:

   ```sh
   npx --yes npm@10.9.9 ci --ignore-scripts
   ```

   O comando deve ser executado dentro dessa cópia temporária. `--ignore-scripts` verifica a instalação e o lockfile sem rodar scripts de pacotes; o deploy da Vercel continua sendo a confirmação final no ambiente Linux dela. `npm ci --dry-run` não substitui essa validação.

5. Revise e envie apenas o lockfile atualizado. Depois, confira o novo log de instalação da Vercel.

Se o erro continuar, compare o primeiro bloco completo de erro do npm, as versões de Node/npm e as dependências mencionadas. O trecho final de uso do comando (`npm help ci`) não mostra a causa original.
