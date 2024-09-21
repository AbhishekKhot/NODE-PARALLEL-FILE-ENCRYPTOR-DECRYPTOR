const fs = require("fs");

class Cryption {
  constructor(strategy) {
    this.strategy = strategy;
  }

  async encrypt(inputFile, outputFile) {
    const readStream = await fs.createReadStream(inputFile);
    const writeStream = await fs.createWriteStream(outputFile);

    for await (const chunk of readStream) {
      console.log("Original chunk:", chunk);
      const encryptedChunk = this.strategy.encrypt(chunk);
      console.log("Encrypted chunk:", encryptedChunk);
      writeStream.write(encryptedChunk);
    }
    writeStream.end();
  }

  async decrypt(inputFile, outputFile) {
    const readStream = await fs.createReadStream(inputFile);
    const writeStream = await fs.createWriteStream(outputFile);

    for await (const chunk of readStream) {
      console.log("Encrypted chunk:", chunk);
      const decryptedChunk = this.strategy.decrypt(chunk);
      console.log("Decrypted chunk:", decryptedChunk);
      writeStream.write(decryptedChunk);
    }
    writeStream.end();
  }
}

module.exports = Cryption;
