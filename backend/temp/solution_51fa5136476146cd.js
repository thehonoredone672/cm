function solve(str) {
    return str.split('').reverse().join('');
}


const fs = require('fs');
try {
  const input = fs.readFileSync(0, 'utf-8').trim();
  console.log(solve(input));
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
