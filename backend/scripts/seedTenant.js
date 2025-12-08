import mongoose from "mongoose";
import dotenv from "dotenv";
import Tenant from "../src/models/Tenant.js";

dotenv.config();

const powerGrid = [
  { name: "Red Ranger City (Delhi)", code: "DEL" },
  { name: "Blue Ranger City (Chennai)", code: "CHN" },
  { name: "Green Ranger City (Bangalore)", code: "BLR" },
];

const activatePowerGrid = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Tenant.deleteMany(); 

    await Tenant.insertMany(powerGrid);

    console.log("Power Grid Activated (Tenants Seeded)");
    process.exit(0);
  } catch (err) {
    console.error("Power Grid Activation Failed:", err);
    process.exit(1);
  }
};

activatePowerGrid();
