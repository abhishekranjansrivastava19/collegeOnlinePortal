const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/errorHandler");
const cron = require("node-cron");
const Reminder = require("./models/reminder");
const Traffic = require("./models/traffic");

// app.use(cors());
app.use(cors({
  origin: 'https://dpserp.com/', // Allows requests from your frontend
  credentials: true, // If you need to allow cookies/auth headers
}));

app.options("*", cors());

// enviornment variable
require("dotenv/config");
const api = process.env.API_URL;


// Delete Old Reminders
const deleteOldReminders = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const result = await Reminder.deleteMany({
      sentAt: { $lt: twentyFourHoursAgo },
    });
    console.log(`${result.deletedCount} old reminders deleted`);
  } catch (error) {
    console.error("Error deleting old reminders:", error);
  }
};

deleteOldReminders();
cron.schedule("0 * * * *", deleteOldReminders);

// Delete Old Traffic
const deleteOldTraffic = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const result = await Traffic.deleteMany({
        timestamp: { $lt: twentyFourHoursAgo },
    });
    console.log(`${result.deletedCount} old traffic deleted`);
  } catch (error) {
    console.error("Error deleting old traffic:", error);
  }
};

deleteOldTraffic();
cron.schedule("0 * * * *", deleteOldTraffic);

// Routers
const usersRouter = require("./routes/users");
const CollegeRouter = require("./routes/colleges");
const moduleRouter = require("./routes/modules");
const superAdminRouter = require("./routes/superadmin");
const stateRouter = require("./routes/states");
const cityRouter = require("./routes/city");
const streamRouter = require("./routes/streams");
const casteRouter = require("./routes/castes");
const sessionRouter = require("./routes/sessions");
const courseRouter = require("./routes/courses");
const majorSubjectRouter = require("./routes/majorsubjects");
const minorSubjectRouter = require("./routes/minorsubjects");
const vocationalSubjectRouter = require("./routes/vocational");
const reminderRouter = require("./routes/reminders");
const trafficRouter = require("./routes/traffic");
const studentRouter = require("./routes/students");
const paymentConfig = require("./routes/paymentconfigs")
const Transaction = require("./routes/payment")
const PaymentDb = require("./routes/paymentdb")
const StudentMaster = require("./routes/studentMaster")
const Document = require("./routes/documents")
const Notice = require("./routes/notices")

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan("tiny"));

app.use(
  "/public/collegelogo",
  express.static(__dirname + "/public/collegelogo")
);
app.use(
  "/public/uploads/documents",
  express.static(__dirname + "/public/uploads/documents")
);
app.use(
  "/public/studentimage",
  express.static(__dirname + "/public/studentimage")
);

app.use(errorHandler);

app.use(authJwt());

app.use(`${api}/traffic`, trafficRouter);
app.use(async (req, res, next) => {
  try {
    const traffic = new Traffic({ count: 1 });
    await traffic.save();
    next();
  } catch (error) {
    console.error("Error logging traffic:", error);
    next();
  }
});

app.use(`${api}/user`, usersRouter);
app.use(`${api}/college`, CollegeRouter);
app.use(`${api}/modules`, moduleRouter);
app.use(`${api}/superAdmin`, superAdminRouter);
app.use(`${api}/states`, stateRouter);
app.use(`${api}/city`, cityRouter);
app.use(`${api}/stream`, streamRouter);
app.use(`${api}/caste`, casteRouter);
app.use(`${api}/session`, sessionRouter);
app.use(`${api}/course`, courseRouter);
app.use(`${api}/majorSubject`, majorSubjectRouter);
app.use(`${api}/minorSubject`, minorSubjectRouter);
app.use(`${api}/vocationalSubject`, vocationalSubjectRouter);
app.use(`${api}/reminder`, reminderRouter);
app.use(`${api}/student`, studentRouter);
app.use(`${api}/payment`, paymentConfig);
app.use(`${api}/transaction`, Transaction);
app.use(`${api}/paymentDb`, PaymentDb);
app.use(`${api}/studentMaster`, StudentMaster);
app.use(`${api}/document`, Document);
app.use(`${api}/notices`, Notice);


mongoose
  .connect(process.env.Connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbname: "College",
  })
  .then(() => {
    console.log("database connection is ready");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(8080, () => {
  console.log("server is running http://localhost:3000");
});
