const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");

//Maximum Size = 100 MB
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({ storage, limits: { fileSize: 1000000 * 100 } }).single(
  "myfile"
);

router.post("/", async (req, res) => {
  const uname = req.body.username;
  try {
    let files;
    if (uname) {
      files = await File.find({ username: uname });
    } else {
      res.status(200).json({});
    }
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  const uuid = req.params.id;
  try {
    const result = await File.findOneAndRemove({ uuid });
    if (result) {
      res.status(200).json("File Deleted Successfullly");
    } else {
      res.status(500).json("Internal Server Error");
    }
  } catch (error) {}
});

router.post("/upload", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }

    const file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
      username: req.body.username,
    });
    const response = await file.save();
    res.json({ file: `${process.env.APP_BASE_URL}/show/${response.uuid}` });
  });
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res
      .status(422)
      .send({ error: "All fields are required except expiry." });
  }
  // Get data from db
  try {
    const file = await File.findOne({ uuid: uuid });
    if (file.sender) {
      return res.status(422).send({ error: "Email already sent once." });
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require("../services/mailService");
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: "inShare file sharing",
      text: `${emailFrom} shared a file with you.`,
      html: require("../services/emailTemplate")({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
        size: parseInt(file.size / 1000) + " KB",
        expires: "24 hours",
      }),
    })
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        return res.status(500).json({ error: "Error in email sending." });
      });
  } catch (err) {
    return res.status(500).send({ error: "Something went wrong." });
  }
});

module.exports = router;
