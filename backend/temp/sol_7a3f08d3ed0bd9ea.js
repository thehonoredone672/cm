function solve(input) { return input.split('').reverse().join(''); }

const _fs = require('fs');
try {
  const _input = _fs.readFileSync(0, 'utf-8').trim();
  const _result = solve(_input);
  process.stdout.write(String(_result));
} catch (e) {
  process.stderr.write(String(e.message || e));
  process.exit(1);
}
