# Correções dirigidas de interface, documentação e testes

Escopo revisado em 29/10/2026 conforme orientação do usuário. Substitui a proposta
de migração geral de páginas: o inventário anterior orienta a investigação, mas
não é uma lista de refatorações obrigatórias.

## Resultado esperado

- Campos resolvem sua aparência por tokens CSS em `data-theme`; não exigir cores
  `white`/`gray` em novos usos. Manter props legadas por compatibilidade.
- Corrigir defeitos atuais delimitados em Input, Textarea, Select e indicador de
  radio, preservando RHF, máscaras, atributos nativos e ações existentes.
- Controles locais continuam permitidos e seguem os mesmos padrões de semântica,
  nome/descrição, teclado, foco, disabled/pending e cursor que os globais.
- Informação essencial permanece visível ou associada ao controle. Tooltip é
  ajuda complementar para ações ambíguas, acessível por foco/hover/Escape, sem
  substituir label, instrução ou erro. Não adicionar tooltips redundantes.
- Storybook permite alternar claro/escuro nos exemplos existentes. Documentação
  explica uso, estados, limites e constituintes sem copiar APIs ou criar páginas
  artificiais. Categorias: Documentação, Componentes e Páginas quando houver caso real.
- Guias e skills devem prevenir novos defeitos sem exigir migração compulsória.

## Fora deste ciclo

Não substituir controles de todas as páginas, extrair um CRUD universal, criar
bibliotecas de variantes/tamanhos, redesenhar contextos institucionais, alterar
backend/permissões ou instalar dependências. Não certificar acessibilidade com axe.

## Evidências que motivam as correções

O levantamento identificou ID externo sobrescrito no Input, erro de Textarea
usando texto em vez de ID, contraste insuficiente do erro escuro e labels de Table
mobile, indicador visual de radio sem acompanhar o estado e navegação do Select
que não pula opções desabilitadas. Cada correção exige reprodução dirigida.
O alerta `aria-hidden-focus` com Select simples aberto exige inspeção de causa,
inclusive elementos escondidos pelo Radix; não desativar a regra para obter verde.

A análise inicial usou oito estados Chromium nos dois temas. Essa amostra não é
aprovação do catálogo. Os resultados atuais serão registrados depois dos testes.

## Verificação

Reutilizar Playwright/axe existentes, dados determinísticos e fronteiras locais.
Verificar nomes/descrições, teclado/foco, seleção, validação e reflow; testar os
estados relevantes nos dois temas. Usar Jest apenas para lógica associada que
precise de prova além do browser. Concluir tipos, lint dos arquivos alterados,
build Storybook, links e revisão do diff. Registrar bloqueios e falhas preexistentes.

[Plano de execução](../plans/2026-10-29-padronizacao-interface.md).
