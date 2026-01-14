import { spawn } from 'child_process';
import readline from 'readline';

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('Usage: node test-runner.js <target1> <target2> ...');
  process.exit(1);
}

const numTargets = targets.length;
const results = targets.map(name => ({
  name,
  output: [],
  status: 'running',
  exitCode: null
}));

const isTTY = process.stdout.isTTY && !process.env.NO_TTY;
const columns = process.stdout.columns || 80;
const paneWidth = Math.floor((columns - (numTargets - 1)) / numTargets);

function stripAnsi(str) {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function draw() {
  if (!isTTY) return;

  const rows = process.stdout.rows || 24;
  const displayRows = rows - 10;

  process.stdout.write('\x1b[H\x1b[J');

  let header = '';
  for (let i = 0; i < numTargets; i++) {
    const name = results[i].name.padEnd(paneWidth).substring(0, paneWidth);
    header += `\x1b[1;36m${name}\x1b[0m`;
    if (i < numTargets - 1) header += '│';
  }
  console.log(header);
  console.log('─'.repeat(columns));

  for (let r = 0; r < displayRows; r++) {
    let line = '';
    for (let i = 0; i < numTargets; i++) {
      const targetOutput = results[i].output;
      const outputIndex = targetOutput.length - displayRows + r;
      let content = '';
      if (outputIndex >= 0 && outputIndex < targetOutput.length) {
        content = stripAnsi(targetOutput[outputIndex]);
      }
      line += content.padEnd(paneWidth).substring(0, paneWidth);
      if (i < numTargets - 1) line += '│';
    }
    console.log(line);
  }

  console.log('─'.repeat(columns));
  
  let statusLine = '';
  for (let i = 0; i < numTargets; i++) {
    const res = results[i];
    let statusText = '';
    let ansiLen = 0;
    if (res.status === 'running') {
      statusText = '\x1b[33mRUNNING...\x1b[0m';
      ansiLen = 9;
    } else if (res.status === 'success') {
      statusText = '\x1b[32m[PASSED]\x1b[0m';
      ansiLen = 9;
    } else {
      statusText = '\x1b[31m[FAILED]\x1b[0m';
      ansiLen = 9;
    }
    
    statusLine += statusText.padEnd(paneWidth + ansiLen).substring(0, paneWidth + ansiLen);
    if (i < numTargets - 1) statusLine += '│';
  }
  console.log(statusLine);
}

const timer = isTTY ? setInterval(draw, 200) : null;

async function runTarget(index) {
  const target = targets[index];
  const res = results[index];

  return new Promise((resolve) => {
    const proc = spawn('make', [target], {
      env: { ...process.env, FORCE_COLOR: '1' },
      shell: true
    });

    const rlStdout = readline.createInterface({ input: proc.stdout });
    const rlStderr = readline.createInterface({ input: proc.stderr });

    const handleLine = (line) => {
      // ANSIエスケープシーケンスを一部除去して表示崩れを防ぐ（必要に応じて）
      res.output.push(line);
    };

    rlStdout.on('line', handleLine);
    rlStderr.on('line', handleLine);

    proc.on('close', (code) => {
      res.exitCode = code;
      res.status = code === 0 ? 'success' : 'failed';
      resolve();
    });
  });
}

if (isTTY) {
  console.log('\x1b[?1049h'); // 代替画面バッファに切り替え
} else {
  console.log(`Running ${numTargets} tests in parallel: ${targets.join(', ')}...`);
}

try {
  await Promise.all(targets.map((_, i) => runTarget(i)));
} finally {
  if (timer) clearInterval(timer);
  if (isTTY) {
    process.stdout.write('\x1b[?1049l'); // 元の画面に戻す
  }
}

// 最終結果の表示
console.log('\n========================================');
console.log('             TEST SUMMARY               ');
console.log('========================================');

let allPassed = true;
for (const res of results) {
  const status = res.status === 'success' ? '\x1b[32m[PASSED]\x1b[0m' : '\x1b[31m[FAILED]\x1b[0m';
  console.log(`${res.name.padEnd(20)}: ${status}`);
  if (res.status !== 'success') {
    allPassed = false;
  }
}
console.log('========================================');

// 失敗したテストがある場合はログを表示
for (const res of results) {
  if (res.status !== 'success') {
    console.log(`\n\x1b[1;31m--- ${res.name} Failed Output ---\x1b[0m`);
    console.log(res.output.join('\n')); // 全ログを表示
  }
}

if (!allPassed) {
  process.exit(1);
}