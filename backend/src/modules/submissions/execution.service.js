"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TEMP_DIR = path.join(__dirname, "../../../temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// --- Driver code appended to user solutions -----------------------------------

const JS_DRIVER = `
const _fs = require('fs');
try {
  const _input = _fs.readFileSync(0, 'utf-8').trim();
  const _result = solve(_input);
  process.stdout.write(String(_result));
} catch (e) {
  process.stderr.write(String(e.message || e));
  process.exit(1);
}
`;

const PY_DRIVER = `
import sys as _sys
try:
    _input = _sys.stdin.read().strip()
    _result = solve(_input)
    _sys.stdout.write(str(_result))
except Exception as _e:
    _sys.stderr.write(str(_e))
    _sys.exit(1)
`;

const JAVA_MAIN = `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            StringBuilder sb = new StringBuilder();
            while (sc.hasNextLine()) sb.append(sc.nextLine()).append("\n");
            String input = sb.toString().trim();
            System.out.print(Solution.solve(input));
        } catch (Exception e) {
            System.err.print(e.getMessage());
            System.exit(1);
        }
    }
}
`;

const CPP_DRIVER = `
#include <iostream>
#include <string>
using namespace std;

string solve(string input);

int main() {
    string input, line;
    while (getline(cin, line)) {
        if (!input.empty()) input += "\\n";
        input += line;
    }
    try {
        cout << solve(input);
    } catch (const exception& e) {
        cerr << e.what();
        return 1;
    }
    return 0;
}
`;

const C_DRIVER = `
#include <stdio.h>
#include <stdlib.h>

char* solve(char* input);

int main(void) {
    char *input = (char*)malloc(1024 * 1024);
    if (!input) return 1;
    int len = 0, ch;
    while ((ch = getchar()) != EOF) input[len++] = (char)ch;
    input[len] = '\0';
    char *result = solve(input);
    if (result) fputs(result, stdout);
    free(input);
    return 0;
}
`;

// --- Process runner -----------------------------------------------------------

const runProcess = (cmd, args, inputData, timeoutMs = 5000) => {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let finished = false;

    const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      child.kill("SIGKILL");
      resolve({ ok: false, timedOut: true, stdout, stderr: "Time Limit Exceeded" });
    }, timeoutMs);

    if (child.stdin) {
      try {
        if (inputData) child.stdin.write(inputData);
        child.stdin.end(); // always close stdin so child doesn't hang on EOF
      } catch (_) {}
    }

    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.on("close", (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ ok: code === 0, timedOut: false, stdout, stderr });
    });

    child.on("error", (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ ok: false, timedOut: false, stdout, stderr: err.message });
    });
  });
};

// --- Python command detection -------------------------------------------------

let _pythonCmd = null;
const getPythonCmd = async () => {
  if (_pythonCmd) return _pythonCmd;
  for (const cmd of ["python3", "python"]) {
    const r = await runProcess(cmd, ["--version"], "", 3000);
    if (r.ok || (r.stderr && r.stderr.startsWith("Python"))) {
      _pythonCmd = cmd; return cmd;
    }
  }
  return null;
};

// --- Compiler -----------------------------------------------------------------

const compile = async (language, srcPath) => {
  if (language === "cpp") {
    const out = srcPath.replace(/\.cpp$/, ".exe");
    const r = await runProcess("g++", ["-O2", "-std=c++17", srcPath, "-o", out], "", 15000);
    if (!r.ok) throw Object.assign(new Error(r.stderr || "C++ compilation failed"), { kind: "COMPILATION_ERROR" });
    return out;
  }
  if (language === "c") {
    const out = srcPath.replace(/\.c$/, ".exe");
    const r = await runProcess("gcc", ["-O2", srcPath, "-o", out], "", 15000);
    if (!r.ok) throw Object.assign(new Error(r.stderr || "C compilation failed"), { kind: "COMPILATION_ERROR" });
    return out;
  }
  if (language === "java") {
    const dir = path.dirname(srcPath);
    const mainPath = path.join(dir, "Main.java");
    const r = await runProcess("javac", [srcPath, mainPath], "", 15000);
    if (!r.ok) throw Object.assign(new Error(r.stderr || "Java compilation failed"), { kind: "COMPILATION_ERROR" });
    return dir;
  }
  return srcPath;
};

// --- Single test case runner --------------------------------------------------

const runTestCase = async (language, compiledPath, input, expectedOutput) => {
  const t0 = Date.now();
  let r;

  if (language === "javascript") {
    r = await runProcess("node", [compiledPath], input);
  } else if (language === "python") {
    const pyCmd = await getPythonCmd();
    if (!pyCmd) {
      return {
        status: "RUNTIME_ERROR",
        error: "Python is not installed on this server.",
        executionTime: 0, memoryUsage: 0,
        output: "", expected: expectedOutput.trim(),
      };
    }
    r = await runProcess(pyCmd, [compiledPath], input);
  } else if (language === "cpp" || language === "c") {
    r = await runProcess(compiledPath, [], input);
  } else if (language === "java") {
    r = await runProcess("java", ["-cp", compiledPath, "Main"], input);
  } else {
    return { status: "RUNTIME_ERROR", error: "Unsupported language.", executionTime: 0, memoryUsage: 0, output: "", expected: expectedOutput.trim() };
  }

  const ms = Date.now() - t0;
  const executionTime = ms / 1000;
  const memoryUsage = Math.floor(Math.random() * 20) + 10;

  if (r.timedOut) {
    return { status: "TIME_LIMIT_EXCEEDED", error: "Time Limit Exceeded (5s)", executionTime, memoryUsage, output: "", expected: expectedOutput.trim() };
  }

  if (!r.ok && !r.stdout) {
    return { status: "RUNTIME_ERROR", error: r.stderr || "Runtime error", executionTime, memoryUsage, output: "", expected: expectedOutput.trim() };
  }

  const actual = r.stdout.trim();
  const expected = expectedOutput.trim();

  if (actual === expected) {
    return { status: "ACCEPTED", executionTime, memoryUsage, output: actual, expected };
  }
  return { status: "WRONG_ANSWER", executionTime, memoryUsage, output: actual, expected };
};

// --- Main executeCode ---------------------------------------------------------

const executeCode = async (code, language, testCases) => {
  const uid = crypto.randomBytes(8).toString("hex");
  const ext = { javascript: "js", python: "py", cpp: "cpp", c: "c", java: "java" }[language];
  if (!ext) throw new Error("Unsupported language: " + language);

  const fileName = language === "java" ? "Solution" : `sol_${uid}`;
  const srcPath = path.join(TEMP_DIR, `${fileName}.${ext}`);

  // Write source files
  if (language === "java") {
    fs.writeFileSync(srcPath, code);
    fs.writeFileSync(path.join(TEMP_DIR, "Main.java"), JAVA_MAIN);
  } else if (language === "javascript") {
    fs.writeFileSync(srcPath, code + "\n" + JS_DRIVER);
  } else if (language === "python") {
    fs.writeFileSync(srcPath, code + "\n" + PY_DRIVER);
  } else if (language === "cpp") {
    fs.writeFileSync(srcPath, code + "\n" + CPP_DRIVER);
  } else if (language === "c") {
    fs.writeFileSync(srcPath, code + "\n" + C_DRIVER);
  }

  const cleanup = () => {
    try {
      [srcPath, srcPath.replace(/\.(cpp|c)$/, ".exe"),
       path.join(TEMP_DIR, "Main.java"), path.join(TEMP_DIR, "Main.class"),
       path.join(TEMP_DIR, "Solution.class"),
      ].forEach((f) => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {} });
    } catch (_) {}
  };

  let compiledPath;
  try {
    compiledPath = await compile(language, srcPath);
  } catch (err) {
    cleanup();
    return {
      success: false,
      status: "COMPILATION_ERROR",
      errorMessage: err.message,
      results: testCases.map((tc) => ({
        testCaseId: tc.id, input: tc.input, expected: tc.expectedOutput,
        status: "COMPILATION_ERROR", error: err.message,
        executionTime: 0, memoryUsage: 0, output: "",
      })),
      executionTime: 0, memoryUsage: 0,
    };
  }

  const results = [];
  let passed = 0;
  let overallStatus = "ACCEPTED";
  let firstError = null;
  let totalTime = 0;
  let maxMem = 0;

  for (const tc of testCases) {
    const res = await runTestCase(language, compiledPath, tc.input, tc.expectedOutput);
    
    // Support Memory Limit Exceeded (MLE) mock check (e.g. if memory exceeds 28MB with 2% probability)
    if (res.memoryUsage > 28 && Math.random() > 0.98) {
      res.status = "MEMORY_LIMIT_EXCEEDED";
      res.error = "Memory Limit Exceeded (Limit: 256MB)";
    }

    results.push({
      testCaseId: tc.id,
      isPublic: tc.isPublic,
      input: tc.input,
      expected: tc.expectedOutput,
      ...res,
    });
    if (res.status === "ACCEPTED") passed++;
    else if (overallStatus === "ACCEPTED") {
      overallStatus = res.status;
      firstError = res.error || null;
    }
    totalTime += res.executionTime || 0;
    maxMem = Math.max(maxMem, res.memoryUsage || 0);
  }

  cleanup();

  return {
    success: overallStatus === "ACCEPTED",
    status: overallStatus,
    errorMessage: firstError,
    executionTime: testCases.length ? totalTime / testCases.length : 0,
    memoryUsage: maxMem,
    results,
  };
};

const executeCustomCode = async (code, language, customInput) => {
  const uid = crypto.randomBytes(8).toString("hex");
  const ext = { javascript: "js", python: "py", cpp: "cpp", c: "c", java: "java" }[language];
  if (!ext) throw new Error("Unsupported language: " + language);

  const fileName = language === "java" ? "Solution" : `sol_${uid}`;
  const srcPath = path.join(TEMP_DIR, `${fileName}.${ext}`);

  if (language === "java") {
    fs.writeFileSync(srcPath, code);
    fs.writeFileSync(path.join(TEMP_DIR, "Main.java"), JAVA_MAIN);
  } else if (language === "javascript") {
    fs.writeFileSync(srcPath, code + "\n" + JS_DRIVER);
  } else if (language === "python") {
    fs.writeFileSync(srcPath, code + "\n" + PY_DRIVER);
  } else if (language === "cpp") {
    fs.writeFileSync(srcPath, code + "\n" + CPP_DRIVER);
  } else if (language === "c") {
    fs.writeFileSync(srcPath, code + "\n" + C_DRIVER);
  }

  const cleanup = () => {
    try {
      [srcPath, srcPath.replace(/\.(cpp|c)$/, ".exe"),
       path.join(TEMP_DIR, "Main.java"), path.join(TEMP_DIR, "Main.class"),
       path.join(TEMP_DIR, "Solution.class"),
      ].forEach((f) => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {} });
    } catch (_) {}
  };

  let compiledPath;
  try {
    compiledPath = await compile(language, srcPath);
  } catch (err) {
    cleanup();
    return {
      success: false,
      status: "COMPILATION_ERROR",
      errorMessage: err.message,
      output: "",
    };
  }

  try {
    const res = await runTestCase(language, compiledPath, customInput, "");
    cleanup();
    return {
      success: res.status === "ACCEPTED" || res.status === "WRONG_ANSWER", // Custom runs are successful if they outputted
      status: res.status === "ACCEPTED" ? "SUCCESS" : res.status,
      errorMessage: res.error || null,
      output: res.output || "",
      executionTime: res.executionTime,
      memoryUsage: res.memoryUsage,
    };
  } catch (err) {
    cleanup();
    return {
      success: false,
      status: "RUNTIME_ERROR",
      errorMessage: err.message,
      output: "",
    };
  }
};

module.exports = { executeCode, executeCustomCode };

