const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

//Connecting Databse
const connectDB = require("./config/db");
connectDB();

//Routes
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api/files", require("./routes/files"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/files/show", require("./routes/show"));
app.use("/api/download", require("./routes/download"));

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
