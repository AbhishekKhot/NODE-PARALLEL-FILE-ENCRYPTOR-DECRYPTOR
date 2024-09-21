const crypto = require("crypto");

class DES {
  constructor(key) {
    this.key = crypto.scryptSync(key, "salt", 8);
    this.algorithm = "des-cbc";
  }

  encrypt(data) {
    const iv = crypto.randomBytes(8);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    return Buffer.concat([iv, cipher.update(data), cipher.final()]);
  }

  decrypt(data) {
    const iv = data.slice(0, 8);
    const encryptedData = data.slice(8);
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  }
}

module.exports = DES;
