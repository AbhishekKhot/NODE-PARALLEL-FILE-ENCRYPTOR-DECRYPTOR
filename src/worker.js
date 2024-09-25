const { parentPort, workerData, threadId } = require("worker_threads");
const { ACTIONS } = require("./lib/constant");
const fs = require("fs");
const Cryption = require("./cryption");
const AES = require("./strategies/aes");
const DES = require("./strategies/des");

async function processFiles({
  action,
  algorithm,
  inputFilePath,
  outputFilePath,
}) {
  const strategy = getStrategy(algorithm);
  const cryption = new Cryption(strategy);
  try {
    if (action === ACTIONS.ENCRYPT) {
      await cryption.encrypt(inputFilePath, outputFilePath);
      parentPort.postMessage(
        `Thread ID: ${threadId}, Action: ${action}, File: ${inputFilePath}`
      );
    } else if (action === ACTIONS.DECRYPT) {
      await cryption.decrypt(inputFilePath, outputFilePath);
      parentPort.postMessage(
        `Worker ID: ${threadId}, Action: ${action}, File: ${inputFilePath}`
      );
    }
    await fs.promises.unlink(inputFilePath);
  } catch (error) {
    parentPort.postMessage(
      `Error processing file ${inputFilePath}: ${error.message}`
    );
  }
}

function getStrategy(algorithm) {
  switch (algorithm) {
    case "AES":
      return new AES();
    case "DES":
      return new DES();
    default:
      return;
  }
}

processFiles(workerData);
