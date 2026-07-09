const fs = require("fs");
const path = require("path");

const logDirectory = path.join(__dirname, "../..", "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const errorLogPath = path.join(logDirectory, "error.log");
const combinedLogPath = path.join(logDirectory, "combined.log");

const writeLog = (level, message, meta = "") => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${meta ? JSON.stringify(meta) : ""}\n`;
  
  // Write to console
  if (level === "error") {
    console.error(logMessage.trim());
  } else {
    console.log(logMessage.trim());
  }

  // Write to log files
  try {
    fs.appendFileSync(combinedLogPath, logMessage);
    if (level === "error") {
      fs.appendFileSync(errorLogPath, logMessage);
    }
  } catch (err) {
    console.error("Failed to write to log file:", err.message);
  }
};

module.exports = {
  info: (message, meta) => writeLog("info", message, meta),
  error: (message, meta) => writeLog("error", message, meta),
  warn: (message, meta) => writeLog("warn", message, meta)
};
