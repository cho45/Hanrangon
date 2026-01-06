#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import { processMathJax } from './lib/mathjax.js';
import { processHighlight } from './lib/highlight.js';
import { processImages } from './lib/images.js';
import { processWidgets } from './lib/widgets.js';
import { stdin, stdout, stderr, argv } from 'node:process';
import readline from 'node:readline';

/**
 * HTML を postprocess する統合処理
 * @param {string} html - 処理対象の HTML
 * @param {string} baseURL - ベース URL
 * @returns {Promise<string>} - 処理後の HTML
 */
async function processHTML(html, baseURL) {
  const startTime = Date.now();
  console.error(`[main] Starting processHTML (input: ${html.length} bytes, baseURL: ${baseURL})`);

  // 1. DOM 構築（一度だけ）
  let stepStart = Date.now();
  console.error('[main] Step 1/5: Building DOM');
  const { window } = new JSDOM(html, {
    features: {
      FetchExternalResources: false,
      ProcessExternalResources: false,
      SkipExternalResources: /./
    }
  });
  const dom = window.document.body;
  console.error(`[main] DOM built in ${Date.now() - stepStart}ms`);

  // 2. MathJax 処理（DOM ベース）
  stepStart = Date.now();
  console.error('[main] Step 2/5: MathJax processing');
  await processMathJax(dom);
  console.error(`[main] MathJax completed in ${Date.now() - stepStart}ms`);

  // 3. シンタックスハイライト
  stepStart = Date.now();
  console.error('[main] Step 3/5: Syntax highlighting');
  await processHighlight(dom);
  console.error(`[main] Highlighting completed in ${Date.now() - stepStart}ms`);

  // 4. 画像処理
  stepStart = Date.now();
  console.error('[main] Step 4/5: Image processing');
  await processImages(dom, baseURL);
  console.error(`[main] Image processing completed in ${Date.now() - stepStart}ms`);

  // 5. ウィジェット処理
  stepStart = Date.now();
  console.error('[main] Step 5/5: Widget processing');
  await processWidgets(dom);
  console.error(`[main] Widget processing completed in ${Date.now() - stepStart}ms`);

  // 6. 処理後の HTML を返す
  const result = dom.innerHTML;
  window.close();

  const totalTime = Date.now() - startTime;
  console.error(`[main] processHTML completed in ${totalTime}ms (output: ${result.length} bytes)`);

  return result;
}

// 引数の解析
let baseURL = '';
let batchMode = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--base-url' && argv[i + 1]) {
    baseURL = argv[i + 1];
  }
  if (argv[i] === '--batch') {
    batchMode = true;
  }
}

if (batchMode) {
  const rl = readline.createInterface({
    input: stdin,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    let inputID;
    try {
      const input = JSON.parse(line);
      inputID = input.id;
      const resultHTML = await processHTML(input.html, baseURL);
      stdout.write(JSON.stringify({ id: input.id, html: resultHTML }) + '\n');
    } catch (error) {
      stderr.write(`Error processing line: ${error.message}\n`);
      stdout.write(JSON.stringify({ id: inputID, error: error.message }) + '\n');
    }
  });
} else {
  // stdin から HTML を読み込み、処理して stdout に出力
  let html = '';
  stdin.setEncoding('utf8');
  stdin.on('data', chunk => html += chunk);
  stdin.on('end', async () => {
    try {
      const result = await processHTML(html, baseURL);
      stdout.write(result);
    } catch (error) {
      stderr.write(`Error: ${error.message}\n${error.stack}\n`);
      process.exit(1);
    }
  });
}