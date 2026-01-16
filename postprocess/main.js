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
 * JSON-RPC 2.0 形式で出力を行う Dispatcher (バッチモード用)
 * 進捗報告、正常結果、エラーをすべて stdout に JSON-RPC メッセージとして送信する
 */
class BatchDispatcher {
  constructor(id) {
    this.id = id;
  }
  progress(message) {
    stdout.write(JSON.stringify({
      jsonrpc: "2.0", id: this.id, method: "progress", params: { message }
    }) + '\n');
  }
  result(html) {
    stdout.write(JSON.stringify({
      jsonrpc: "2.0", id: this.id, result: { html }
    }) + '\n');
  }
  error(error) {
    stdout.write(JSON.stringify({
      jsonrpc: "2.0", id: this.id, error: {
        code: -32000,
        message: error.message,
        data: { stack: error.stack }
      }
    }) + '\n');
  }
}

/**
 * 従来の CLI 形式で出力を行う Dispatcher (ワンショット実行用)
 * 結果は stdout に HTML として、ログは stderr に出力する
 */
class CLIDispatcher {
  progress(message) {
    stderr.write(`[postprocess] ${message}\n`);
  }
  result(html) {
    stdout.write(html);
  }
  error(error) {
    stderr.write(`Error: ${error.message}\n${error.stack}\n`);
    process.exit(1);
  }
}

/**
 * HTML を postprocess する統合処理
 * MathJax、シンタックスハイライト、画像処理、ウィジェット処理を行う
 *
 * @param {string} html - 処理対象の HTML
 * @param {string} baseURL - ベース URL（画像などのリソース解決に使用）
 * @param {BatchDispatcher|CLIDispatcher} dispatcher - 出力先（進捗と結果を送信）
 */
async function processHTML(html, baseURL, dispatcher) {
  const startTime = performance.now();
  const logDone = (msg) => {
    const totalTime = performance.now() - startTime;
    dispatcher.progress(`processHTML: ${msg} in ${totalTime.toFixed(2)}ms`);
  };

  if (!html.includes('<')) {
    logDone(`skipping (no tags found, input: ${html.length} bytes)`);
    dispatcher.result(html);
    return;
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
    logDone(`skipping (no processors matched, input: ${html.length} bytes)`);
    dispatcher.result(html);
    return;
  }

  dispatcher.progress(`processHTML: start (input: ${html.length} bytes, baseURL: ${baseURL}, active: ${[...activeNames].join(', ')})`);

  if (!JSDOM) {
    const importStart = performance.now();
    JSDOM = (await import('jsdom')).JSDOM;
    dispatcher.progress(`processHTML: JSDOM imported in ${(performance.now() - importStart).toFixed(2)}ms`);
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
  dispatcher.progress(`processHTML: DOM built in ${(performance.now() - stepStart).toFixed(2)}ms`);

  // 各プロセッサを順次実行
  for (const processor of processors) {
    if (activeNames.has(processor.constructor.name) && processor.applies(dom)) {
      const stepStart = performance.now();
      await processor.run(dom, baseURL);
      const elapsed = performance.now() - stepStart;
      dispatcher.progress(`processHTML: Step ${processor.constructor.name} completed in ${elapsed.toFixed(2)}ms`);
    }
  }

  // 処理後の HTML を返す
  const result = dom.innerHTML;
  window.close();

  logDone(`completed (output: ${result.length} bytes)`);
  dispatcher.result(result);
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
  // === バッチモード: JSON-RPC 2.0 による常駐プロセスとして動作 ===
  // stdin から1行ずつ JSON-RPC リクエストを読み取り、stdout に JSON-RPC レスポンスを返す。
  // アイドルタイムアウトにより、一定時間リクエストがない場合は自動終了する。

  const rl = readline.createInterface({
    input: stdin,
    terminal: false
  });

  let idleTimeout = 30 * 60 * 1000; // デフォルト 30分
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--idle-timeout' && argv[i + 1]) {
      idleTimeout = parseInt(argv[i + 1], 10);
    }
  }

  let idleTimer;
  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      console.error(`[main] Idle timeout reached (${idleTimeout}ms), exiting...`);
      process.exit(0);
    }, idleTimeout);
  };

  resetIdleTimer();

  // 【設計上の意図】リクエストは逐次処理（await による待機）を行う
  // 理由: postprocess は CPU バウンドな処理が中心（DOM操作、MathJax、シンタックスハイライト）で、
  //       I/O 待ちがほとんど発生しないため、並行処理にしても性能向上はほぼ見込めない。
  //       また、JSDOM や MathJax の内部状態の競合リスクを避けるため、逐次処理が安全。
  //       Go 側は sync.Map で複数リクエストを並行管理しているが、Node.js 側では
  //       リクエストをキューイングして順番に処理することで、シンプルかつ安全な実装を保つ。
  (async () => {
    for await (const line of rl) {
      if (!line.trim()) continue;

      resetIdleTimer();

      let dispatcher;
      try {
        const input = JSON.parse(line);
        dispatcher = new BatchDispatcher(input.id);
        await processHTML(input.params?.html || input.html, baseURL, dispatcher);
      } catch (error) {
        if (dispatcher) {
          dispatcher.error(error);
        } else {
          stderr.write(`Error processing line: ${error.message}\n`);
        }
      }
    }
  })();
} else {
  // === ワンショットモード: 従来の CLI インターフェース ===
  // stdin から HTML 全体を読み込み、処理結果を stdout に出力して終了する。
  let html = '';
  stdin.setEncoding('utf8');
  stdin.on('data', chunk => html += chunk);
  stdin.on('end', async () => {
    const dispatcher = new CLIDispatcher();
    try {
      await processHTML(html, baseURL, dispatcher);
    } catch (error) {
      dispatcher.error(error);
    }
  });
}
