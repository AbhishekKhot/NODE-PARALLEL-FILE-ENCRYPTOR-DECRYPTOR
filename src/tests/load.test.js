const fs = require("fs").promises;
const path = require("path");
const { Worker } = require("worker_threads");
const { faker } = require("@faker-js/faker");
const { ACTIONS } = require("../lib/constant");

const TEMP_DIR = path.join(__dirname, "..", "temp");
const ENCRYPTED_DIR = path.join(__dirname, "..", "..", "encrypted_files");
const DECRYPTED_DIR = path.join(__dirname, "..", "..", "decrypted_files");
const FILE_COUNT = 10;

describe("Encryption and Decryption Load Test", () => {
  beforeAll(async () => {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.mkdir(ENCRYPTED_DIR, { recursive: true });
    await fs.mkdir(DECRYPTED_DIR, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    await fs.rm(ENCRYPTED_DIR, { recursive: true, force: true });
    await fs.rm(DECRYPTED_DIR, { recursive: true, force: true });
  });

  test(`Create ${FILE_COUNT} files with Faker content`, async () => {
    const createFilePromises = [];
    for (let i = 0; i < FILE_COUNT; i++) {
      const fileName = `file_${i}.txt`;
      const filePath = path.join(TEMP_DIR, fileName);
      const content = generateFakerContent();
      createFilePromises.push(fs.writeFile(filePath, content));
    }
    await Promise.all(createFilePromises);

    const files = await fs.readdir(TEMP_DIR);
    expect(files.length).toBe(FILE_COUNT);
  });

  test(`Encrypt ${FILE_COUNT} files`, async () => {
    const files = await fs.readdir(TEMP_DIR);
    const encryptPromises = files.map((file) =>
      runWorker(
        ACTIONS.ENCRYPT,
        "AES",
        path.join(TEMP_DIR, file),
        path.join(ENCRYPTED_DIR, file)
      )
    );
    await Promise.all(encryptPromises);

    const encryptedFiles = await fs.readdir(ENCRYPTED_DIR);
    expect(encryptedFiles.length).toBe(FILE_COUNT);
  });

  test(`Decrypt ${FILE_COUNT} files`, async () => {
    const files = await fs.readdir(ENCRYPTED_DIR);
    const decryptPromises = files.map((file) =>
      runWorker(
        ACTIONS.DECRYPT,
        "AES",
        path.join(ENCRYPTED_DIR, file),
        path.join(DECRYPTED_DIR, file)
      )
    );
    await Promise.all(decryptPromises);

    const decryptedFiles = await fs.readdir(DECRYPTED_DIR);
    expect(decryptedFiles.length).toBe(FILE_COUNT);
  });

  // test("Load test: Concurrent encryption and decryption", async () => {
  //   const files = await fs.readdir(TEMP_DIR);
  //   const concurrentOperations = files.flatMap((file) => [
  //     runWorker(
  //       ACTIONS.ENCRYPT,
  //       "AES",
  //       path.join(TEMP_DIR, file),
  //       path.join(ENCRYPTED_DIR, `${file}.enc`)
  //     ),
  //     runWorker(
  //       ACTIONS.DECRYPT,
  //       "AES",
  //       path.join(ENCRYPTED_DIR, file),
  //       path.join(DECRYPTED_DIR, `${file}.dec`)
  //     ),
  //   ]);

  //   const startTime = Date.now();
  //   await Promise.all(concurrentOperations);
  //   const endTime = Date.now();

  //   console.log(
  //     `Concurrent encryption and decryption took ${endTime - startTime} ms`
  //   );
  // });
});

function generateFakerContent() {
  return faker.lorem.paragraphs(2000);
}

function runWorker(action, algorithm, inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "..", "worker.js"), {
      workerData: { action, algorithm, inputFilePath, outputFilePath },
    });
    worker.on("message", (message) => {
      console.log(message);
      resolve();
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}
