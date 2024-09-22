const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const { ACTIONS } = require("./lib/constant");
const { Worker } = require("worker_threads");

async function main() {
  const { action, directory, algorithm, key } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      choices: [ACTIONS.ENCRYPT, ACTIONS.DECRYPT],
      message: "Choose an action: ",
    },
    {
      type: "input",
      name: "directory",
      message: "Enter the directory name: ",
    },
    {
      type: "list",
      name: "algorithm",
      message: "Choose an algorithm: ",
      choices: ["AES", "DES", "RSA"],
    },
  ]);

  const files = await fs.promises.readdir(directory);
  const outputDirectory =
    action == ACTIONS.ENCRYPT ? "encrypted_files" : "decrypted_files";

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  const promises = [];
  for (const file of files) {
    const inputFilePath = path.join(directory, file);
    const outputFilePath = path.join(outputDirectory, file);

    const fileStats = await fs.promises.lstat(inputFilePath);
    if (!fileStats.isFile()) {
      throw new Error("The specified path is not a file.");
    }

    /* Push a new promise for each worker thread */
    promises.push(runWorker(action, algorithm, inputFilePath, outputFilePath));
  }

  /* Wait for all worker threads to finish processing */
  await Promise.all(promises);
}

function runWorker(action, algorithm, inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "worker.js"), {
      workerData: { action, algorithm, inputFilePath, outputFilePath },
    });
    worker.on("message", (message) => {
      console.log(message);
      resolve();
    });
    worker.on("error", (error) => {
      console.log(error.message);
      reject(error);
    });
    worker.on("exit", (code) => {
      if (code != 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

main();
