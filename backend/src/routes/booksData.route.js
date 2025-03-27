import express from "express"
import { getBooksData } from "../controllers/booksData.controller.js"

const router = express.Router()

router.get("/", getBooksData)

export default router