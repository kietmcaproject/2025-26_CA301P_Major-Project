const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const runCode = (req, res) => {
  const { code, language, input, runInDocker, testCases } = req.body;

  try {
    const filename = {
      python: "Main.py",
      cpp: "Main.cpp",
      java: "Main.java",
    }[language];

    // ensure temp dir exists and write file
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const filepath = path.join(tempDir, filename);
    console.log("Writing file:", filepath);
    fs.writeFileSync(filepath, code, "utf8");

    // choose docker image (you can keep your local custom image name)
    const dockerImage =
      language === "python"
        ? "python:3"
        : language === "cpp"
        ? "gcc:latest"
        : "openjdk:latest";

    // convert Windows backslashes to forward slashes for the mount and quote the mount path
    const mountPath = tempDir.replace(/\\/g, "/");

    const containerCmd =
      language === "python"
        ? `python /app/${filename}`
        : language === "cpp"
        ? `/bin/sh -c "g++ /app/${filename} -o /app/a.out && /app/a.out"`
        : `/bin/sh -c "javac /app/${filename} -d /app && java -cp /app Main"`;

    const dockerCmd = `docker run --rm -i -v "${mountPath}:/app" ${dockerImage} ${containerCmd}`;

    const child = exec(dockerCmd, (err, stdout, stderr) => {
      if (err) {
        console.log("exec error:", err);
        return res.status(500).json({ error: err.message, stderr });
      }
      res.json({
        output: stdout.trim(),
        stderr: stderr ? stderr.trim() : undefined,
      });
    });

    if (input) {
      // If the user already provided multiple lines, keep them
      if (input.includes("\n")) {
        child.stdin.write(input.trim() + "\n");
      } else {
        // Otherwise, split by space into multiple lines
        input.split(" ").forEach((val) => {
          child.stdin.write(val + "\n");
        });
      }
    }
    child.stdin.end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = runCode;
