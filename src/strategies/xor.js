class XOR {
  constructor(key) {
    this.key = Buffer.from(key);
  }

  encrypt(data) {
    return this.xor(data);
  }

  decrypt(data) {
    return this.xor(data);
  }

  xor(data) {
    const result = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ this.key[i % this.key.length];
    }
    return result;
  }
}

module.exports = XOR;
