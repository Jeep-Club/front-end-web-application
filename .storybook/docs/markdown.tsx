import { AnchorMdx, Markdown } from "@storybook/addon-docs/blocks";
import type { ComponentProps } from "react";

const documentationPages: Record<string, string> = {
  "/docs/architecture.md": "documentação-arquitetura--docs",
  "/docs/design.md": "documentação-design--docs",
  "/docs/development.md": "documentação-desenvolvimento--docs",
  "/docs/components-and-pages.md": "documentação-componentes-e-páginas--docs",
  "/docs/testing.md": "documentação-testes--docs",
};

function DocumentationLink({ href = "", children }: ComponentProps<"a">) {
  if (/^(https?:|mailto:)/i.test(href)) {
    return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
  }
  if (href.startsWith("#")) return <AnchorMdx href={href} target="_self">{children}</AnchorMdx>;

  const relative = new URL(href, "https://repository.invalid/docs/");
  const page = documentationPages[decodeURIComponent(relative.pathname)];
  if (page) {
    return <AnchorMdx href={`?path=/docs/${encodeURIComponent(page)}${relative.hash}`} target="_self">{children}</AnchorMdx>;
  }

  // Fora dos cinco guias, mantenha a referência ao arquivo no repositório,
  // sem servir o código-fonte ou arquivos de ambiente pelo Storybook.
  const segments = decodeURIComponent(relative.pathname).split("/").filter(Boolean);
  if (relative.pathname === "/.storybook/main.ts") {
    return <span>{children} <code>(.storybook/main.ts, configuração local)</code></span>;
  }
  const kind = segments.at(-1)?.includes(".") ? "blob" : "tree";
  const source = `https://github.com/Jeep-Club/front-end-web-application/${kind}/chore/config-agents/${segments.map(encodeURIComponent).join("/")}${relative.hash}`;
  return <a href={source} target="_blank" rel="noreferrer" title="Referência no repositório; requer acesso e arquivo publicado na branch.">{children}</a>;
}

export const markdownOptions: ComponentProps<typeof Markdown>["options"] = {
  overrides: {
    a: { component: DocumentationLink },
    table: { props: { tabIndex: 0, style: { display: "block", maxWidth: "100%", overflowX: "auto" } } },
    pre: { props: { tabIndex: 0, style: { maxWidth: "100%", overflowX: "auto" } } },
    code: { props: { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } } },
  },
};
