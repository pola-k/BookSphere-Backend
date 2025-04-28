import express from "express"
import multer from "multer"
import { upload } from "../middleware/multer.middleware.js"
import { GetComments, CreateComment, DeleteComment, EditComment } from "../controllers/comments.controller.js"
import { GetPosts, CreateTextPost, CreateMediaPost, DeletePost } from "../controllers/posts.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

import { GetUser , signup , Login } from "../controllers/user.controller.js"
import { GetRatings , SubmitRating  } from "../controllers/rating.controllers.js"
const router = express.Router()



// router.post("/logout", Logout)


router.get("/get-comments", GetComments)
router.post("/create-comment", CreateComment)
router.delete("/delete-comment", DeleteComment)
router.put("/update-comment", EditComment)

router.get("/:bookId/rating",GetRatings)
router.post("/:bookId/rate",SubmitRating)

// user ki profile ka data access karna 
router.get("/profile/", GetUser)

router.get("/get-posts", GetPosts)
router.post("/create-text-post", CreateTextPost)
router.post("/create-media-post", upload.array("media", 10), (req, res, next) => {
    try {
        CreateMediaPost(req, res);
    } catch (err) {
        next(err);
    }
});

// Custom error handler
router.use((err, req, res, next) => {
    
    if (err.status === 400) {
        return res.status(err.status).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
});

router.delete("/delete-post", DeletePost)
// new user created
router.post("/signup", signup)
router.post("/login",Login)

export default router
