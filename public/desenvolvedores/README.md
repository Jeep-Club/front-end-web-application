# Equipe de desenvolvimento

Esta pasta reúne as fotos e as informações dos desenvolvedores exibidos ao final da landing page, antes do rodapé, em um carrossel de cartas 3D. No computador, use as setas laterais, arraste as cartas com o mouse ou foque a lista e use as setas do teclado. As teclas Home e End levam ao início e ao final. No celular, deslize as cartas ou use os botões. Não há avanço automático.

Em telas grandes, aparecem quatro cartas completas e parte da quinta para indicar a continuação da lista. Em telas menores, a quantidade se adapta e a próxima carta também fica parcialmente visível.

## Como preencher

1. Coloque as fotos nesta pasta. Use nomes simples, sem espaços ou acentos, por exemplo: `ana-silva.jpg`. Formatos recomendados: JPG, PNG ou WebP; prefira retratos verticais na proporção 3:4, com pelo menos 480 × 640 pixels e o rosto centralizado. As fotos preenchem a carta, com recorte quando necessário.
2. Abra `equipe.json` e preencha `nome`, `cargo` e `foto` de cada pessoa. Mantenha o `id` único de cada registro.
3. No campo `foto`, informe apenas o nome do arquivo, incluindo a extensão. Respeite maiúsculas e minúsculas.

Exemplo de um registro:

```json
{
  "id": "dev-01",
  "nome": "Ana Silva",
  "cargo": "Desenvolvedora Front-end",
  "foto": "ana-silva.jpg"
}
```

Os registros aparecem na mesma ordem do arquivo. Separe os registros com vírgulas, sem deixar vírgula após o último. Enquanto `foto` estiver vazia ou se a imagem não carregar, o cartão exibirá um ícone de pessoa.

Para visualizar, execute `npm run dev` na raiz do projeto e abra `http://localhost:3000/#desenvolvedores`. Alterações no JSON são incorporadas ao aplicativo; em produção, faça uma nova compilação/publicação após editar.

Os arquivos nesta pasta são públicos. Inclua apenas nomes, cargos e fotos destinados à publicação, com autorização das pessoas envolvidas.
