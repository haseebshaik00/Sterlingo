const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const usersRouter = require("./routes/users.js");
const expensesRouter = require("./routes/expenses.js");
const debtsRouter = require("./routes/debts.js");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(usersRouter);
app.use(expensesRouter);
app.use(debtsRouter);

const password = process.env.PASSWORD || "changePasswordHere";
let devUrl = `mongodb+srv://haseebSterlingo:${password}@cluster0.gtt1pi3.mongodb.net/?retryWrites=true&w=majority`;
var mongoDB = process.env.MONGODB_URI || devUrl;

mongoose
  .connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => console.log(error));
let db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("Connected successfully.");
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running at port ${port}.`);
});

module.exports = app;
// api key: 70GxlVlfxm0VuNncDCwSwXrvG1lS3m9cXUP4o01hEiuXDvWZBK6oYSVBpRKm0x26