import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { readLocalUrl } from "../config/local-urls.cjs";

const require = createRequire(import.meta.url);
const server = process.argv[2];
if (!["next", "storybook"].includes(server)) throw new Error("Selecione next ou storybook.");
const url = readLocalUrl(server === "next" ? "APP_URL" : "STORYBOOK_URL");
const port = url.port || "80";
// Argumentos separados preservam caminhos Windows e dispensam expansão de variáveis pelo shell.
const args = server === "next"
  ? [require.resolve("next/dist/bin/next"), "dev", "--hostname", url.hostname, "--port", port]
  : [resolve(dirname(require.resolve("storybook/package.json")), require("storybook/package.json").bin), "dev", "--host", url.hostname, "--port", port, "--disable-telemetry"];
const child = spawn(process.execPath, [...args, ...process.argv.slice(3)], { stdio: "inherit", env: process.env });
child.on("error", (error) => { throw error; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
