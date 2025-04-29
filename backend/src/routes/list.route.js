import express from "express"
import { getUserList, addBookToList, removeBookFromList } from "../controllers/list.controller.js"

const router = express.Router()

router.get("/getUserList", getUserList)
router.post("/addBookToList", addBookToList)
router.delete("/removeBookFromList", removeBookFromList)

export default router