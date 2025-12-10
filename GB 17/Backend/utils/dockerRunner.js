const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const util = require("util");

const execPromise = util.promisify(exec);

const runCodeInDocker = async (code, language, input = "") => {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const fileMap = {
    cpp: { name: "main.cpp", build: "g++ main.cpp -o main", run: "./main" },
    java: { name: "Main.java", build: "javac Main.java", run: "java Main" },
    python: { name: "main.py", build: "", run: "python3 main.py" },
  };

  const config = fileMap[language];
  if (!config) throw new Error("Unsupported language");

  const filePath = path.join(tempDir, config.name);
  fs.writeFileSync(filePath, code);

  try {
    const dockerImage = {
      cpp: "gcc:latest",
      java: "openjdk:latest",
      python: "python:3.10",
    }[language];

    let command = `
      docker run --rm -i \
      -v ${tempDir}:/app -w /app ${dockerImage} \
      /bin/bash -c "${config.build && config.build + ' && '} echo '${input}' | ${config.run}"
    `;

    const { stdout, stderr } = await execPromise(command);
    return { output: stdout || stderr || "No output" };
  } catch (error) {
    return { output: error.stderr || error.message };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

module.exports = runCodeInDocker;