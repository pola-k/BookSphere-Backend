import express from "express"
import {  Logout  } from "../controllers/auth.controller.js"
import { GetComments, CreateComment, DeleteComment, EditComment } from "../controllers/comments.controller.js"
import { authMiddleware , authenticateToken }from "../middleware/auth.middleware.js"
import { GetUser , signup , Login } from "../controllers/user.controller.js"
import { GetRatings , SubmitRating  } from "../controllers/rating.controllers.js"
const router = express.Router()



router.post("/logout", Logout)


router.get("/get-comments", GetComments)
router.post("/create-comment", CreateComment)
router.delete("/delete-comment", DeleteComment)
router.put("/update-comment", EditComment)

router.get("/:bookId/rating",GetRatings)
router.post("/:bookId/rate",SubmitRating)

// user ki profile ka data access karna 
router.get("/profile/", GetUser)

// new user created
router.post("/signup", signup)
router.post("/login",Login)

export default router
