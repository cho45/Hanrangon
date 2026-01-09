#!/usr/bin/env node

import { MathJaxProcessor } from './lib/mathjax.js';
import { ABCProcessor } from './lib/abcjs.js';
import { HighlightProcessor } from './lib/highlight.js';
import { ImageProcessor } from './lib/images.js';
import { WidgetProcessor } from './lib/widgets.js';
import { stdin, stdout, stderr, argv } from 'node:process';
import readline from 'node:readline';

let JSDOM;

// プロセッサのインスタンス化（永続プロセスで再利用される）
const processors = [
  new MathJaxProcessor(),
  new ABCProcessor(),
  new HighlightProcessor(),
  new ImageProcessor(),
  new WidgetProcessor()
];

// 判定用の正規表現を連結して生成（名前付きキャプチャグループを使用）
const combinedRegex = new RegExp(
  processors
    .map(p => `(?<${p.constructor.name}>${p.constructor.appliesRegexp.source})`)
    .join('|'),
  'g'
);

/**
 * HTML を postprocess する統合処理
 * @param {string} html - 処理対象の HTML
 * @param {string} baseURL - ベース URL
 * @returns {Promise<string>} - 処理後の HTML
 */
async function processHTML(html, baseURL) {
  if (!html.includes('<')) {
    console.error(`[main] processHTML: skipping (no tags found, input: ${html.length} bytes)`);
    return html;
  }

  // 高速な事前判定
  const matches = html.matchAll(combinedRegex);
  const activeNames = new Set();
  for (const match of matches) {
    for (const [name, value] of Object.entries(match.groups)) {
      if (value) activeNames.add(name);
    }
  }

  if (activeNames.size === 0) {
    console.error(`[main] processHTML: skipping (no processors matched, input: ${html.length} bytes)`);
    return html;
  }

  const startTime = performance.now();
  console.error(`[main] processHTML: start (input: ${html.length} bytes, baseURL: ${baseURL}, active: ${[...activeNames].join(', ')})`);

  if (!JSDOM) {
    const importStart = performance.now();
    JSDOM = (await import('jsdom')).JSDOM;
    console.error(`[main] processHTML: JSDOM imported in ${(performance.now() - importStart).toFixed(2)}ms`);
  }

  // 1. DOM 構築（一度だけ）
  let stepStart = performance.now();
  const { window } = new JSDOM(html, {
    features: {
      FetchExternalResources: false,
      ProcessExternalResources: false,
      SkipExternalResources: /./
    }
  });
  const dom = window.document.body;
  console.error(`[main] processHTML: DOM built in ${(performance.now() - stepStart).toFixed(2)}ms`);

  // 各プロセッサを順次実行
  for (const processor of processors) {
    if (activeNames.has(processor.constructor.name) && processor.applies(dom)) {
      const stepStart = performance.now();
      await processor.run(dom, baseURL);
      const elapsed = performance.now() - stepStart;
      console.error(`[main] processHTML: Step ${processor.constructor.name} completed in ${elapsed.toFixed(2)}ms`);
    }
  }

  // 処理後の HTML を返す
  const result = dom.innerHTML;
  window.close();

  const totalTime = performance.now() - startTime;
  console.error(`[main] processHTML: completed in ${totalTime.toFixed(2)}ms (output: ${result.length} bytes)`);

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
