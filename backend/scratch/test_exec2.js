const { executeCode } = require("../src/modules/submissions/execution.service");
const code = `function solve(input) { return input.split("").reverse().join(""); }`;
const testCases = [
  { id: "1", input: "hello", expectedOutput: "olleh", isPublic: true },
  { id: "2", input: "world", expectedOutput: "dlrow", isPublic: true },
];
executeCode(code, "javascript", testCases).then(result => {
  console.log(JSON.stringify(result, null, 2));
}).catch(err => {
  console.error("CRASH:", err.message);
  console.error(err.stack);
});
