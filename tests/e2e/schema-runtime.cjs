/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test bootstrap loads the existing TypeScript schemas without changing the application bundler. */
const path = require('node:path');
const Module = require('node:module');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'Node', jsx: 'react-jsx' } });
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, parent, ...rest) {
    return resolve.call(this, name.startsWith('@/') ? path.resolve(__dirname, '../../src', name.slice(2)) : name, parent, ...rest);
};
const { z } = require('zod');
const load = name => require(path.resolve(__dirname, '../../src/schemas', name));
const { pageResponseSchema: page } = load('page');
module.exports = { z, page, load };
