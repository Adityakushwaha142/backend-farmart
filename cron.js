const connectDB = require("./config/db");
const File = require("./models/file");
const fs = require("fs");

connectDB();

// Records older than 24 hours.
async function clearData() {
  const files = await File.find({
    createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  console.log(files);
  if (files.length) {
    for (const file of files) {
      try {
        fs.unlinkSync(file.path);
        await file.remove();
        console.log(`successfully deleted ${file.filename}`);
      } catch (err) {
        console.log(`error while deleting file ${err} `);
      }
    }
  }
  console.log("Job done!");
}

clearData().then(process.exit);
