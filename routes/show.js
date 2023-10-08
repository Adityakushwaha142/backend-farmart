const router = require("express").Router();
const File = require("../models/file");

router.get("/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
   
    // Link expired
    if (!file) {
      const data = {
        downloadLink: "Link has been Expired",
        fileName: "Expired",
        username: "Expired Username",
        createdAt: "Expired Date",
      };
      res.status(200).json(data);
    } else {
      const data = {
        uuid: file.uuid,
        fileName: file.filename,
        fileSize: file.size,
        downloadLink: `${process.env.APP_BASE_URL}/show/${file.uuid}`,
        createdAt: file.createdAt,
        username: file.username,
      };
      res.status(200).json(data);
    }
  } catch (err) {
    const data = {
      downloadLink: "Link has been Expired",
      fileName: "Expired",
      username: "Expired Username",
      createdAt: "Expired Date",
    };
    res.status(200).json(data);
  }
});

module.exports = router;
