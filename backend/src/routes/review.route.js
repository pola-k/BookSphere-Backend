import express from "express"
import { postReview, getReview } from "../controllers/review.controller.js"

const router = express.Router()
router.post("/postreview", postReview)
router.get("/getreview", getReview)

export default router