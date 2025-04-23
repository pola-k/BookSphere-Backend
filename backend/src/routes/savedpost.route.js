import express from "express";
import { GetSavedPosts } from "../controllers/savedPost.controller.js"; // Import controller function

const router = express.Router();

// Route to save a post
router.get("/saved-posts/", GetSavedPosts);
export default router;
