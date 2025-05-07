import { sequelize } from "./index.js";
import "./models/associations.js"

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Sync models (update schema without deleting data)
    console.log("✅ Database synchronized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    process.exit(1);
  }
};

syncDatabase();