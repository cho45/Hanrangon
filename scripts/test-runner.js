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

const ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

function color(code, str) {
  return isTTY ? `\x1b[${code}m${str}\x1b[0m` : str;
}

function sliceVisible(str, width) {
  str = str.replace(/\t/g, '  ').replace(/\r/g, '');
  let vWidth = 0, result = '', i = 0;
  while (i < str.length) {
    const match = str.slice(i).match(ANSI_RE);
    if (match && str.indexOf(match[0]) === i) {
      result += match[0];
      i += match[0].length;
    } else {
      const char = str[i], cw = /[^\x00-\xff]/.test(char) ? 2 : 1;
      if (vWidth + cw > width) {
        // 残り文字がある場合のみ '…' に置換
        if (str.slice(i).replace(ANSI_RE, '').length > 0) {
          // 最後の1文字を削って '…' にする。
          // result から最後の表示文字を1つ消す
          let lastCharMatch = result.match(/([^\x00-\xff]|[\x00-\xff])(?:\x1b\[[0-9;]*m)*$/);
          if (lastCharMatch) {
            result = result.slice(0, result.length - lastCharMatch[0].length) + lastCharMatch[0].replace(/^([^\x00-\xff]|[\x00-\xff])/, '…');
          }
        }
        vWidth = width;
        break;
      }
      result += char;
      vWidth += cw;
      i++;
    }
  }
  return result + (isTTY ? '\x1b[0m' : '') + ' '.repeat(Math.max(0, width - vWidth));
}

function draw() {
  if (!isTTY) return;

  const rows = process.stdout.rows || 24;
  const displayRows = Math.max(1, rows - 10);

  process.stdout.write('\x1b[H'); // Cursor to home

  const printLine = (line) => process.stdout.write(line + '\x1b[K\n');

  let header = '';
  for (let i = 0; i < numTargets; i++) {
    header += color('1;36', sliceVisible(results[i].name, paneWidth));
    if (i < numTargets - 1) header += '│';
  }
  printLine(header);
  printLine('─'.repeat(columns));

  for (let r = 0; r < displayRows; r++) {
    let line = '';
    for (let i = 0; i < numTargets; i++) {
      const targetOutput = results[i].output;
      const outputIndex = targetOutput.length - displayRows + r;
      const content = (outputIndex >= 0 && outputIndex < targetOutput.length) ? targetOutput[outputIndex] : '';
      line += sliceVisible(content, paneWidth);
      if (i < numTargets - 1) line += '│';
    }
    printLine(line);
  }

  printLine('─'.repeat(columns));
  
  let statusLine = '';
  for (let i = 0; i < numTargets; i++) {
    const res = results[i];
    let statusText = '';
    if (res.status === 'running') {
      statusText = color('33', 'RUNNING...');
    } else if (res.status === 'success') {
      statusText = color('32', '[PASSED]');
    } else {
      statusText = color('31', '[FAILED]');
    }
    statusLine += sliceVisible(statusText, paneWidth);
    if (i < numTargets - 1) statusLine += '│';
  }
  printLine(statusLine);
  process.stdout.write('\x1b[J'); // Clear remaining screen
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
  process.stdout.write('\x1b[?1049h\x1b[?25l'); // 代替画面バッファ & カーソル非表示
} else {
  console.log(`Running ${numTargets} tests in parallel: ${targets.join(', ')}...`);
}

try {
  await Promise.all(targets.map((_, i) => runTarget(i)));
} finally {
  if (timer) clearInterval(timer);
  if (isTTY) {
    process.stdout.write('\x1b[?1049l\x1b[?25h'); // 元の画面に戻す & カーソル表示
  }
}

// 最終結果の表示
console.log('\n' + '─'.repeat(40));
console.log('             TEST SUMMARY               ');
console.log('─'.repeat(40));

let allPassed = true;
for (const res of results) {
  const status = res.status === 'success' ? color('32', '[PASSED]') : color('31', '[FAILED]');
  console.log(`${res.name.padEnd(20)}: ${status}`);
  if (res.status !== 'success') {
    allPassed = false;
  }
}
console.log('========================================');

// 失敗したテストがある場合はログを表示
for (const res of results) {
  if (res.status !== 'success') {
    console.log(`\n${color('1;31', `--- ${res.name} Failed Output ---`)}`);
    console.log(res.output.join('\n')); // 全ログを表示
  }
}

if (!allPassed) {
  process.exit(1);
}