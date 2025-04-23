import express from "express"
import { getRating, updateRating } from "../controllers/rating.controller.js"

const router = express.Router()

router.get("/getRating", getRating)
router.post("/updateRating", updateRating)

export default router