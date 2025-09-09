if (process.env.NODE_ENV != "production") {
  const path = require("path");
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/staysphere";
const dbUrl = process.env.ATLAS_URL;

main()
  .then(() => console.log("Connection successful!"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "68bfa1cd4b9ea6dc985c571a",
  }));

  await Listing.insertMany(initData.data);
  console.log("Initialization successful!");
};

initDB();
