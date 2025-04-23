import express from "express"
import { postReview } from "../controllers/review.controller.js"

const router = express.Router()
router.post("/postreview", postReview)

export default router