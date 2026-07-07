const { executeCode } = require("../src/modules/submissions/execution.service");

async function runTests() {
  console.log("Testing JavaScript Execution...");
  const jsCode = `
function solve(input) {
  const nums = input.split(',').map(Number);
  return nums.reduce((a, b) => a + b, 0);
}
`;
  const jsResult = await executeCode(jsCode, "javascript", [
    { id: "1", input: "1,2,3", expectedOutput: "6", isPublic: true },
    { id: "2", input: "10,20", expectedOutput: "30", isPublic: true }
  ]);
  console.log("JavaScript Result:", JSON.stringify(jsResult, null, 2));

  console.log("\nTesting Python Execution...");
  const pyCode = `
def solve(input_str):
    nums = [int(x) for x in input_str.split(',')]
    return sum(nums)
`;
  const pyResult = await executeCode(pyCode, "python", [
    { id: "1", input: "1,2,3", expectedOutput: "6", isPublic: true },
    { id: "2", input: "10,20", expectedOutput: "30", isPublic: true }
  ]);
  console.log("Python Result:", JSON.stringify(pyResult, null, 2));
}

runTests().catch(console.error);
