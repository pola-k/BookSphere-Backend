import express from "express"
import { login, Logout, singup } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/signup", singup)

router.post("/login", login)

router.post("/logout", Logout)

export default router