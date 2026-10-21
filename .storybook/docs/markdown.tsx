/// <reference types="vite/client" />

import { AnchorMdx, Markdown } from "@storybook/addon-docs/blocks";
import type { ComponentProps } from "react";

const documentationPages: Record<string, string> = {
  "/docs/architecture.md": "documentação-arquitetura--docs",
  "/docs/design.md": "documentação-design--docs",
  "/docs/development.md": "documentação-desenvolvimento--docs",
  "/docs/components-and-pages.md": "documentação-componentes-e-páginas--docs",
  "/docs/testing.md": "documentação-testes--docs",
};

// Only documentation images enter Vite's asset graph; never source/config files.
const documentationImages = import.meta.glob<string>(
  "/docs/**/*.{png,jpg,jpeg,gif,webp,avif,svg}",
  { eager: true, query: "?url", import: "default" },
);

export function markdownOptions(sourceFile: string): ComponentProps<typeof Markdown>["options"] {
  function resolve(reference: string) {
    return new URL(reference, new URL(sourceFile, "https://repository.invalid/"));
  }

  function assetUrl(reference: string) {
    const resolved = resolve(reference);
    const pathname = decodeURIComponent(resolved.pathname);
    const suffix = resolved.search + resolved.hash;
    // staticDirs serves public/ at the catalog root, including in the static build.
    if (pathname.startsWith("/public/")) return `./${resolved.pathname.slice(8)}${suffix}`;
    return documentationImages[pathname]
      ? documentationImages[pathname] + suffix
      : undefined;
  }

  function DocumentationLink({ href = "", children, ...props }: ComponentProps<"a">) {
    if (/^(https?:|mailto:|tel:|\/\/)/i.test(href)) {
      return <a {...props} href={href} target="_blank" rel="noreferrer">{children}</a>;
    }
    if (href.startsWith("#") || href.startsWith("?path=")) {
      return <AnchorMdx {...props} href={href} target="_self">{children}</AnchorMdx>;
    }
    const relative = resolve(href);
    const pathname = decodeURIComponent(relative.pathname);
    const page = documentationPages[pathname];
    if (page) {
      return <AnchorMdx {...props} href={`?path=/docs/${encodeURIComponent(page)}${relative.hash}`} target="_self">{children}</AnchorMdx>;
    }
    const asset = assetUrl(href);
    if (asset) return <a {...props} href={asset}>{children}</a>;
    return <span>{children} <code>({pathname.slice(1)}{relative.hash})</code></span>;
  }

  function DocumentationImage({ src = "", alt = "", ...props }: ComponentProps<"img">) {
    const reference = typeof src === "string" ? src : "";
    const url = /^(https?:|data:image\/|\/\/)/i.test(reference) ? reference : assetUrl(reference);
    if (!url) return <span>{alt} <code>({reference}, imagem não encontrada)</code></span>;
    // Markdown images use the browser directly, without Next's image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={url} alt={alt} style={{ maxWidth: "100%", height: "auto" }} />;
  }

  return {
    overrides: {
      a: { component: DocumentationLink },
      img: { component: DocumentationImage },
      table: { props: { tabIndex: 0, style: { display: "block", maxWidth: "100%", overflowX: "auto" } } },
      pre: { props: { tabIndex: 0, style: { maxWidth: "100%", overflowX: "auto" } } },
      code: { props: { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } } },
    },
  };
}
