const crypto = require("crypto");

class RSA {
  constructor(publicKey, privateKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  encrypt(data) {
    const chunkSize = 214; /* Max size for RSA-2048 */
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      chunks.push(crypto.publicEncrypt(this.publicKey, chunk));
    }
    return Buffer.concat(chunks);
  }

  decrypt(data) {
    const chunkSize = 256; /* Size of encrypted chunk for RSA-2048 */
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      chunks.push(crypto.privateDecrypt(this.privateKey, chunk));
    }
    return Buffer.concat(chunks);
  }
}

module.exports = RSA;
