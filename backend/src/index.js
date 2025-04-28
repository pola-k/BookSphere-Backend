import express from "express"
import { sequelize, s3 } from "./db.js"; // DB connection
import authRoutes from "./routes/auth.route.js"
import cors from 'cors';
const app = express()

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes)
// app.use("/api/getbooksdata", booksData)
// app.use("/api/list", listRoutes)
// app.use("/api/rating", ratingRoutes)
// app.use("/api/review", reviewRoutes)
//

app.listen(5001, () => {
    console.log("Server is running on port 5001")
})

export { sequelize, s3 };
