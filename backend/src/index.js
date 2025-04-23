import express from "express"
import { sequelize, s3 } from "./db.js"; // DB connection
import authRoutes from "./routes/auth.route.js"
import booksData from "./routes/booksData.route.js"
import dotenv from "dotenv";
const app = express()
app.use(express.json());

app.use("/api/auth", authRoutes)
app.use("/api/getbooksdata", booksData)

app.listen(5001, () => {
    console.log("Server is running on port 5001")
})

export { sequelize, s3 };
