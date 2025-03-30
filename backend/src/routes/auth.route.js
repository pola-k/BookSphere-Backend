import express from "express"
import { login, Logout, singup } from "../controllers/auth.controller.js"
import { GetComments, CreateComment, DeleteComment, EditComment } from "../controllers/comments.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/signup", singup)

router.post("/login", login)

router.post("/logout", Logout)

router.get("/get-comments", GetComments)
router.post("/create-comment", CreateComment)
router.delete("/delete-comment", DeleteComment)
router.put("/update-comment", EditComment)

export default router