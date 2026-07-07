const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TEMP_DIR = path.join(__dirname, "../../../temp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Driver scripts templates to append to user solutions
const DRIVER_SCRIPTS = {
  javascript: `
const fs = require('fs');
try {
  const input = fs.readFileSync(0, 'utf-8').trim();
  console.log(solve(input));
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
`,
  python: `
import sys
try:
    input_str = sys.stdin.read().strip()
    print(solve(input_str))
except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)
`,
  java: `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            StringBuilder sb = new StringBuilder();
            while(sc.hasNextLine()) {
                sb.append(sc.nextLine()).append("\\n");
            }
            String input = sb.toString().trim();
            System.out.print(Solution.solve(input));
        } catch (Exception e) {
            System.err.print(e.getMessage());
            System.exit(1);
        }
    }
}
`,
  cpp: `
#include <iostream>
#include <string>
using namespace std;

string solve(string input);

int main() {
    try {
        string input, line;
        while(getline(cin, line)) {
            input += line + "\\n";
        }
        if (!input.empty() && input.back() == '\\n') {
            input.pop_back();
        }
        cout << solve(input);
    } catch (const exception& e) {
        cerr << e.what();
        return 1;
    }
    return 0;
}
`,
  c: `
#include <stdio.h>
#include <stdlib.h>

char* solve(char* input);

int main() {
    try {
        char *input = malloc(1024 * 1024);
        int len = 0;
        int ch;
        while((ch = getchar()) != EOF) {
            input[len++] = ch;
        }
        input[len] = '\\0';
        printf("%s", solve(input));
        free(input);
    } catch (...) {
        return 1;
    }
    return 0;
}
`
};

const runProcess = (cmd, args, inputData, timeoutMs = 3000) => {
  return new Promise((resolve) => {
    const child = spawn(cmd, args);
    let stdout = "";
    let stderr = "";
    let isFinished = false;

    const timer = setTimeout(() => {
      if (!isFinished) {
        child.kill();
        isFinished = true;
        resolve({ status: "TIME_LIMIT_EXCEEDED", stdout, stderr: "Time Limit Exceeded" });
      }
    }, timeoutMs);

    if (inputData && child.stdin) {
      try {
        child.stdin.write(inputData);
        child.stdin.end();
      } catch (e) {
        console.error("Stdin write failed", e);
      }
    }

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (isFinished) return;
      clearTimeout(timer);
      isFinished = true;
      resolve({ status: code === 0 ? "SUCCESS" : "RUNTIME_ERROR", stdout, stderr });
    });

    child.on("error", (err) => {
      if (isFinished) return;
      clearTimeout(timer);
      isFinished = true;
      resolve({ status: "COMPILATION_ERROR", stdout, stderr: err.message });
    });
  });
};

const executeSingleTestCase = async (language, sourceFilePath, input, expectedOutput) => {
  const startTime = Date.now();
  let result;

  if (language === "javascript") {
    result = await runProcess("node", [sourceFilePath], input);
  } else if (language === "python") {
    result = await runProcess("python", [sourceFilePath], input);
  } else if (language === "cpp") {
    const exePath = sourceFilePath.replace(/\.cpp$/, ".exe");
    result = await runProcess(exePath, [], input);
  } else if (language === "c") {
    const exePath = sourceFilePath.replace(/\.c$/, ".exe");
    result = await runProcess(exePath, [], input);
  } else if (language === "java") {
    const classDir = path.dirname(sourceFilePath);
    result = await runProcess("java", ["-cp", classDir, "Main"], input);
  } else {
    return { status: "RUNTIME_ERROR", error: `Unsupported language: ${language}` };
  }

  const executionTime = (Date.now() - startTime) / 1000; // in seconds
  // Mock memory usage (between 1MB and 32MB) for demonstration, or we can use process info if needed
  const memoryUsage = Math.floor(Math.random() * 20) + 12; // in MB

  const actualOutput = result.stdout.trim();
  const cleanedExpected = expectedOutput.trim();

  if (result.status === "SUCCESS") {
    if (actualOutput === cleanedExpected) {
      return { status: "ACCEPTED", executionTime, memoryUsage, output: actualOutput };
    } else {
      return { 
        status: "WRONG_ANSWER", 
        executionTime, 
        memoryUsage, 
        output: actualOutput, 
        expected: cleanedExpected 
      };
    }
  } else if (result.status === "TIME_LIMIT_EXCEEDED") {
    return { status: "TIME_LIMIT_EXCEEDED", executionTime, memoryUsage, error: "Time Limit Exceeded" };
  } else {
    return { status: result.status, executionTime, memoryUsage, error: result.stderr || "Runtime Error" };
  }
};

const compileCode = async (language, sourceFilePath) => {
  if (language === "cpp") {
    const exePath = sourceFilePath.replace(/\.cpp$/, ".exe");
    const compileResult = await runProcess("g++", [sourceFilePath, "-o", exePath]);
    if (compileResult.status !== "SUCCESS") {
      throw new Error(compileResult.stderr || "C++ compilation failed");
    }
  } else if (language === "c") {
    const exePath = sourceFilePath.replace(/\.c$/, ".exe");
    const compileResult = await runProcess("gcc", [sourceFilePath, "-o", exePath]);
    if (compileResult.status !== "SUCCESS") {
      throw new Error(compileResult.stderr || "C compilation failed");
    }
  } else if (language === "java") {
    const compileResult = await runProcess("javac", [sourceFilePath]);
    if (compileResult.status !== "SUCCESS") {
      throw new Error(compileResult.stderr || "Java compilation failed");
    }
  }
};

const executeCode = async (code, language, testCases) => {
  const fileId = crypto.randomBytes(8).toString("hex");
  let fileExtension = "";
  if (language === "javascript") fileExtension = "js";
  else if (language === "python") fileExtension = "py";
  else if (language === "cpp") fileExtension = "cpp";
  else if (language === "c") fileExtension = "c";
  else if (language === "java") fileExtension = "java";
  else throw new Error(`Unsupported language: ${language}`);

  // For Java, file name must match the public class name (which in our template is Solution or Main depending on structure)
  // To avoid conflict, compile Main.java that imports/contains Solution
  const fileName = language === "java" ? "Solution" : `solution_${fileId}`;
  const filePath = path.join(TEMP_DIR, `${fileName}.${fileExtension}`);

  // Append driver script
  const fullCode = code + "\n" + (DRIVER_SCRIPTS[language] || "");
  
  // For Java, write the Solution.java file AND write the Main.java file
  let mainFilePath = "";
  if (language === "java") {
    fs.writeFileSync(filePath, fullCode);
    mainFilePath = path.join(TEMP_DIR, `Main.java`);
    fs.writeFileSync(mainFilePath, DRIVER_SCRIPTS.java);
  } else {
    fs.writeFileSync(filePath, fullCode);
  }

  const cleanup = () => {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (language === "java" && fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
      
      // Cleanup compiler outputs
      if (language === "cpp") {
        const exePath = filePath.replace(/\.cpp$/, ".exe");
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
      } else if (language === "c") {
        const exePath = filePath.replace(/\.c$/, ".exe");
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
      } else if (language === "java") {
        const solutionClass = filePath.replace(/\.java$/, ".class");
        const mainClass = path.join(TEMP_DIR, "Main.class");
        if (fs.existsSync(solutionClass)) fs.unlinkSync(solutionClass);
        if (fs.existsSync(mainClass)) fs.unlinkSync(mainClass);
      }
    } catch (e) {
      console.error("Cleanup failed", e);
    }
  };

  try {
    // Compile step for compiled languages
    await compileCode(language, language === "java" ? mainFilePath : filePath);
  } catch (err) {
    cleanup();
    return {
      success: false,
      status: "COMPILATION_ERROR",
      errorMessage: err.message || "Compilation failed",
      results: testCases.map(() => ({ status: "COMPILATION_ERROR", error: err.message }))
    };
  }

  // Execute test cases
  const results = [];
  let allPassed = true;
  let status = "ACCEPTED";
  let totalTime = 0;
  let maxMemory = 0;
  let errorMessage = null;

  for (const tc of testCases) {
    try {
      const runRes = await executeSingleTestCase(
        language, 
        language === "java" ? mainFilePath : filePath, 
        tc.input, 
        tc.expectedOutput
      );
      results.push({
        testCaseId: tc.id,
        isPublic: tc.isPublic,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        ...runRes
      });

      if (runRes.status !== "ACCEPTED") {
        allPassed = false;
        if (status === "ACCEPTED") {
          status = runRes.status;
          errorMessage = runRes.error || `Failed testcase. Expected: ${tc.expectedOutput}, Got: ${runRes.output}`;
        }
      }

      totalTime += runRes.executionTime || 0;
      maxMemory = Math.max(maxMemory, runRes.memoryUsage || 0);
    } catch (e) {
      allPassed = false;
      results.push({
        testCaseId: tc.id,
        isPublic: tc.isPublic,
        status: "RUNTIME_ERROR",
        error: e.message
      });
      if (status === "ACCEPTED") {
        status = "RUNTIME_ERROR";
        errorMessage = e.message;
      }
    }
  }

  cleanup();

  return {
    success: allPassed,
    status,
    errorMessage,
    executionTime: totalTime / testCases.length,
    memoryUsage: maxMemory,
    results
  };
};

module.exports = {
  executeCode,
};
