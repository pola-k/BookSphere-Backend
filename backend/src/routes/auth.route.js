import express from "express";
import multer from "multer";
import { upload } from "../middleware/multer.middleware.js";
import {
    GetComments,
    CreateComment,
    DeleteComment,
    EditComment,
} from "../controllers/comments.controller.js";
import {
    GetPosts,
    CreateTextPost,
    CreateMediaPost,
    DeletePost,
} from "../controllers/posts.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { GetUser, signup, Login } from "../controllers/user.controller.js";
import {
    SavePost,
    UnsavePost,
    GetSavedPosts,
} from "../controllers/savedPost.controller.js";

const router = express.Router();

// 🗨️ Comment routes
router.get("/get-comments", GetComments);
router.post("/create-comment", CreateComment);
router.delete("/delete-comment", DeleteComment);
router.put("/update-comment", EditComment);

// 👤 User profile
router.get("/profile/:id", GetUser);

// 📝 Post routes
router.get("/get-posts", GetPosts);
router.post("/create-text-post", CreateTextPost);
router.post("/create-media-post", upload.array("media", 10), (req, res, next) => {
    try {
        CreateMediaPost(req, res);
    } catch (err) {
        next(err);
    }
});
router.delete("/delete-post", DeletePost);

// 🔐 Auth routes
router.post("/signup", signup);
router.post("/login", Login);

// 🔖 Saved post routes (✅ Secured with authMiddleware)
router.post("/save-post", authMiddleware, SavePost);
router.post("/unsave-post", authMiddleware, UnsavePost);
router.get("/saved-posts", authMiddleware, GetSavedPosts);

// ❗ Custom error handler
router.use((err, req, res, next) => {
    if (err.status === 400) {
        return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
});

export default router;
