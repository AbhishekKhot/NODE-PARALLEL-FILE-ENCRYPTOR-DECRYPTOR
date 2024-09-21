const crypto = require("crypto");
require("dotenv").config();

class AES {
  constructor() {
    this.method = process.env.AES_ENCRYPTION_METHOD;
  }

  encrypt(buffer) {
    const { key, iv } = this.#getKeyAndIv();
    const cipher = crypto.createCipheriv(this.method, key, iv);
    const encryptedChunk = Buffer.concat([
      cipher.update(buffer),
      cipher.final(),
    ]);
    return encryptedChunk;
  }

  decrypt(buffer) {
    const { key, iv } = this.#getKeyAndIv();
    const decipher = crypto.createDecipheriv(this.method, key, iv);
    const decryptedChunk = Buffer.concat([
      decipher.update(buffer),
      decipher.final(),
    ]);
    return decryptedChunk;
  }

  #getKeyAndIv() {
    const key = crypto
      .createHash("sha512")
      .update(process.env.AES_SECRET_KEY)
      .digest("hex")
      .substring(0, 32);
    const iv = crypto
      .createHash("sha512")
      .update(process.env.AES_SECRET_IV)
      .digest("hex")
      .substring(0, 16);
    return { key, iv };
  }
}

module.exports = AES;
