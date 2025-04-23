import express from "express";
import { getAllBooksIDs, getBooksDataByGenre, getBooksDataById, getLatestBooksData, getTrendingBooksData } from "../controllers/books.controller.js";

const router = express.Router();

router.get("/genre/:genre", getBooksDataByGenre)
router.get("/id/:id", getBooksDataById)
router.get("/latest", getLatestBooksData)
router.get("/all", getAllBooksIDs)
router.get("/trending", getTrendingBooksData)

export default router
