const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const Cryption = require("./cryption");
const AES = require("./strategies/aes");
const DES = require("./strategies/des");
const RSA = require("./strategies/rsa");
const XOR = require("./strategies/xor");
const { ACTIONS } = require("./lib/constant");

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
      choices: ["AES", "DES", "RSA", "XOR"],
    },
  ]);

  let strategy;
  switch (algorithm) {
    case "AES":
      strategy = new AES();
      break;
    case "DES":
      strategy = new DES(key);
      break;
    case "RSA":
      const publicKey = fs.readFileSync(
        path.join(__dirname, "../keys/rsa_public.pem")
      );
      const privateKey = fs.readFileSync(
        path.join(__dirname, "../keys/rsa_private.pem")
      );
      strategy = new RSA(publicKey, privateKey);
      break;
    case "XOR":
      strategy = new XOR();
      break;
    default:
      return;
  }

  const cryption = new Cryption(strategy);

  try {
    const files = await fs.promises.readdir(directory);
    for (const file of files) {
      const inputFilePath = path.join(directory, file);

      const outputDirectory =
        action == ACTIONS.ENCRYPT ? "encrypted_files" : "decrypted_files";
      const outputFilePath = path.join(outputDirectory, file);

      const fileStats = await fs.promises.lstat(inputFilePath);
      if (!fileStats.isFile()) {
        throw new Error("The specified path is not a file.");
      }

      if (action === ACTIONS.DECRYPT) {
        await cryption.decrypt(inputFilePath, outputFilePath);
        console.log("File decrypted successfully!");
      } else {
        await cryption.encrypt(inputFilePath, outputFilePath);
        console.log("File encrypted successfully!");
      }
      await fs.promises.unlink(inputFilePath);
    }
  } catch (error) {
    console.log("Something went wrong, ", error.message);
  }
}

main();
