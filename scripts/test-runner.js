import { spawn } from 'child_process';
import readline from 'readline';

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('Usage: node test-runner.js <target1>...');
  process.exit(1);
}

const isTTY = process.stdout.isTTY && !process.env.NO_TTY;
const columns = process.stdout.columns || 80;
const paneWidth = Math.floor((columns - (targets.length - 1)) / targets.length);

const ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const COMBINED_RE = new RegExp(`${ANSI_RE.source}|.`, 'gu');
const STATUS_MAP = {
  running: ['33', 'RUNNING...'],
  success: ['32', '[PASSED]'],
  failed: ['31', '[FAILED]']
};

const results = targets.map(name => ({ name, output: [], status: 'running' }));
const color = (c, s) => isTTY ? `\x1b[${c}m${s}\x1b[0m` : s;

const sliceVisible = (str, width) => {
  let vWidth = 0;
  let res = '';
  const normalized = str.replace(/\t/g, '  ').replace(/\r/g, '');

  for (const [c] of normalized.matchAll(COMBINED_RE)) {
    if (c.match(ANSI_RE)) {
      res += c;
      continue;
    }
    const cw = /\p{Extended_Pictographic}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}/u.test(c) ? 2 : 1;
    if (vWidth + cw > width) {
      res = res.replace(/(\p{Extended_Pictographic}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|.)((?:\x1b\[[0-9;]*m)*)$/u, '…$2');
      vWidth = width;
      break;
    }
    res += c;
    vWidth += cw;
  }
  return res + (isTTY ? '\x1b[0m' : '') + ' '.repeat(Math.max(0, width - vWidth));
};

const draw = () => {
  if (!isTTY) return;
  const rows = process.stdout.rows || 24;
  const displayRows = Math.max(1, rows - 10);

  let out = '\x1b[H';
  const line = s => out += s + '\x1b[K\n';

  line(results.map(r => color('1;36', sliceVisible(r.name, paneWidth))).join('│'));
  line('─'.repeat(columns));

  for (let r = 0; r < displayRows; r++) {
    const row = results.map(res => {
      const content = res.output[res.output.length - displayRows + r] || '';
      return sliceVisible(content, paneWidth);
    });
    line(row.join('│'));
  }

  line('─'.repeat(columns));
  line(results.map(r => sliceVisible(color(...STATUS_MAP[r.status]), paneWidth)).join('│'));

  process.stdout.write(out + '\x1b[J');
};

if (isTTY) {
  process.stdout.write('\x1b[?1049h\x1b[?25l');
} else {
  console.log(`Running ${targets.length} tests in parallel: ${targets.join(', ')}...`);
}

const timer = isTTY ? setInterval(draw, 200) : null;

try {
  await Promise.all(targets.map((target, i) => new Promise(resolve => {
    const res = results[i];
    const proc = spawn('make', [target], { env: { ...process.env, FORCE_COLOR: '1' }, shell: true });
    const rl = s => readline.createInterface({ input: s }).on('line', l => res.output.push(l));
    rl(proc.stdout);
    rl(proc.stderr);
    proc.on('close', code => {
      res.status = code === 0 ? 'success' : 'failed';
      resolve();
    });
  })));
} finally {
  if (timer) clearInterval(timer);
  if (isTTY) process.stdout.write('\x1b[?1049l\x1b[?25h');
}

console.log(`\n${'─'.repeat(40)}\n             TEST SUMMARY               \n${'─'.repeat(40)}`);
results.forEach(r => {
  const [c, s] = STATUS_MAP[r.status];
  console.log(`${r.name.padEnd(20)}: ${color(c, s)}`);
});
console.log('='.repeat(40));

results.filter(r => r.status !== 'success').forEach(r => {
  console.log(`\n${color('1;31', `--- ${r.name} Failed Output ---`)}\n${r.output.join('\n')}`);
});

if (results.some(r => r.status !== 'success')) process.exit(1);