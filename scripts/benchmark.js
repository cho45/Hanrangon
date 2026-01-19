import readline from 'readline';

const isTTY = process.stdout.isTTY;
const color = (c, s) => isTTY ? `\x1b[${c}m${s}\x1b[0m` : s;

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const benchmarks = [];
let goos, goarch, pkg, cpu;
let currentBenchmark = null;

rl.on('line', (line) => {
  // Skip pure log lines
  if (/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} /.test(line) && !line.includes('Benchmark')) return;

  if (line.startsWith('goos:')) goos = line.split(': ')[1];
  else if (line.startsWith('goarch:')) goarch = line.split(': ')[1];
  else if (line.startsWith('pkg:')) pkg = line.split(': ')[1];
  else if (line.startsWith('cpu:')) cpu = line.split(': ')[1];
  else if (line.startsWith('Benchmark')) {
    const parts = line.split(/\s+/).filter(p => p.length > 0);
    currentBenchmark = { name: parts[0] };
    // If results are on the same line (parts[1] is iterations)
    if (parts.length >= 3 && /^\d+$/.test(parts[1])) {
      if (parseResults(currentBenchmark, parts.slice(1))) {
        benchmarks.push(currentBenchmark);
        currentBenchmark = null;
      }
    }
  } else if (currentBenchmark && line.trim().match(/^\d+/)) {
    // Results on a separate line
    const parts = line.trim().split(/\s+/).filter(p => p.length > 0);
    if (parseResults(currentBenchmark, parts)) {
      benchmarks.push(currentBenchmark);
      currentBenchmark = null;
    }
  }
});

function parseResults(bench, parts) {
  if (parts.length < 2) return false;
  
  bench.iterations = parts[0];
  const nsOpIdx = parts.indexOf('ns/op');
  if (nsOpIdx > 0) {
    bench.nsOp = parseFloat(parts[nsOpIdx - 1]);
  } else {
    return false;
  }
  
  const bOpIdx = parts.indexOf('B/op');
  bench.bOp = bOpIdx > 0 ? parseInt(parts[bOpIdx - 1]) : '-';
  
  const allocsOpIdx = parts.indexOf('allocs/op');
  bench.allocsOp = allocsOpIdx > 0 ? parseInt(parts[allocsOpIdx - 1]) : '-';
  
  return true;
}

function formatBytes(bytes) {
  if (bytes === '-' || bytes === undefined) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

rl.on('close', () => {
  console.log(`\n${color(1, 'Benchmark Results')}`);
  console.log(`${color(36, 'OS:')}      ${goos}`);
  console.log(`${color(36, 'Arch:')}    ${goarch}`);
  console.log(`${color(36, 'CPU:')}     ${cpu}`);
  console.log(`${color(36, 'Package:')} ${pkg}\n`);

  const headers = ['Benchmark Name', 'Iter', 'ms/req', 'req/s', 'B/op', 'allocs/op', 'ratio'];
  const colWidths = [35, 10, 10, 12, 12, 10, 8];

  const row = (cols) => cols.map((c, i) => String(c).padEnd(colWidths[i])).join(' ');

  // ms/req で降順にソート
  benchmarks.sort((a, b) => (b.nsOp || 0) - (a.nsOp || 0));

  // BenchmarkHandleStatic-8 を基準とする
  const baseBench = benchmarks.find(b => b.name.startsWith('BenchmarkHandleStatic'));
  const baseNs = baseBench ? baseBench.nsOp : null;

  console.log(color(1, row(headers)));
  console.log('-'.repeat(colWidths.reduce((a, b) => a + b + 1, 0)));

  benchmarks.forEach(b => {
    const msReqVal = b.nsOp !== undefined ? b.nsOp / 1000000 : null;
    const msReq = msReqVal !== null ? msReqVal.toFixed(3) : '-';
    const reqSec = msReqVal !== null ? Math.round(1000 / msReqVal).toLocaleString() : '-';
    const ratio = (baseNs && b.nsOp !== undefined) ? (b.nsOp / baseNs).toFixed(1) + 'x' : '-';

    console.log(row([
      b.name,
      b.iterations,
      msReq,
      reqSec,
      formatBytes(b.bOp),
      b.allocsOp !== '-' && b.allocsOp !== undefined ? b.allocsOp.toLocaleString() : '-',
      ratio
    ]));
  });
  console.log();
});