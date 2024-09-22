const fs = require("fs");

class Cryption {
  constructor(strategy) {
    this.strategy = strategy;
  }

  async encrypt(inputFile, outputFile) {
    const readStream = await fs.createReadStream(inputFile);
    const writeStream = await fs.createWriteStream(outputFile);

    for await (const chunk of readStream) {
      const encryptedChunk = this.strategy.encrypt(chunk);
      writeStream.write(encryptedChunk);
    }
    writeStream.end();
  }

  async decrypt(inputFile, outputFile) {
    const readStream = await fs.createReadStream(inputFile);
    const writeStream = await fs.createWriteStream(outputFile);

    for await (const chunk of readStream) {
      const decryptedChunk = this.strategy.decrypt(chunk);
      writeStream.write(decryptedChunk);
    }
    writeStream.end();
  }
}

module.exports = Cryption;
