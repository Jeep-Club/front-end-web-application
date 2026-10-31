// CommonJS mantém a interoperabilidade de @next/env no Node e no carregador do Playwright.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { loadEnvConfig } = require("@next/env");

// Carrega .env* também nos comandos Node e no Playwright, com a precedência do Next.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

/**
 * Lê uma origem HTTP local; impede que servidores e testes usem destinos remotos por engano.
 * @param {string} name Nome da variável definida em .env.
 * @returns {URL} Origem validada, sem credenciais, caminho, query ou fragmento.
 * @throws {Error} Se a variável estiver ausente ou não representar uma origem local válida.
 */
function readLocalUrl(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} no .env conforme .env.example.`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} deve ser uma URL HTTP local válida.`);
  }
  if (url.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(url.hostname)
    || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${name} deve conter somente uma origem HTTP local, sem caminho ou credenciais.`);
  }
  return url;
}

exports.readLocalUrl = readLocalUrl;
