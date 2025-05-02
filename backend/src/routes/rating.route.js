import express from "express"
import { getRating, updateRating, updateRatingStats } from "../controllers/rating.controller.js"

const router = express.Router()

router.get("/getRating", getRating)
router.post("/updateRating", updateRating)
router.get("/getRatingStats", updateRatingStats)

export default router