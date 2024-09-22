const crypto = require("crypto");
require("dotenv").config();

class DES {
  constructor() {
    this.method = process.env.DES_ENCRYPTION_METHOD;
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
      .update(process.env.DES_SECRET_KEY)
      .digest("hex")
      .substring(0, 24);

    const iv = crypto
      .createHash("sha512")
      .update(process.env.DES_SECRET_IV)
      .digest("hex")
      .substring(0, 8);

    return { key, iv };
  }
}

module.exports = DES;
