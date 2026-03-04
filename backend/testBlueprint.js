require("dotenv").config();
const connectDB = require("./config/db");
const Blueprint = require("./models/InterviewBlueprint");

connectDB();

console.log(Blueprint);