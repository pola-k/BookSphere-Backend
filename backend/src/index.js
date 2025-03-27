import express from "express"
import authRoutes from "./routes/auth.route.js"
import booksData from "./routes/booksData.route.js"

const app = express()

app.use("/api/auth", authRoutes)
app.use("/api/getbooksdata", booksData)

app.listen(5001, () => {
    console.log("Server is running on port 5001")
})