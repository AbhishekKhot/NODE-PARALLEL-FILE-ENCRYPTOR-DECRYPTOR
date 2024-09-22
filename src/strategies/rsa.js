const crypto = require("crypto");

class RSA {
  encrypt(data) {
    const chunkSize = 214; /* Max size for RSA-2048 */
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      chunks.push(crypto.publicEncrypt(process.env.RSA_PUBLIC_KEY, chunk));
    }
    return Buffer.concat(chunks);
  }

  decrypt(data) {
    const chunkSize = 256; /* Size of encrypted chunk for RSA-2048 */
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      chunks.push(crypto.privateDecrypt(process.env.RSA_PRIVATE_KEY, chunk));
    }
    return Buffer.concat(chunks);
  }
}

module.exports = RSA;
