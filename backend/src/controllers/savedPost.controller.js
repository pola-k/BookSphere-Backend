import SavedPost from "../models/saved_post.js"; 
import Post from "../models/post.js";
import User from "../models/user.js";

const SavePost = async (req, res) => {
    try {
        console.log("🔥 SavePost body:", req.body); // log incoming data

        const { user_id, post_id } = req.body;
        if (!user_id || !post_id) {
            console.log("❌ Missing user_id or post_id");
            return res.status(400).json({ error: "user_id and post_id are required" });
        }

        const user = await User.findByPk(user_id);
        if (!user) {
            console.log("❌ User not found:", user_id);
            return res.status(404).json({ error: "User not found" });
        }

        const post = await Post.findByPk(post_id);
        if (!post) {
            console.log("❌ Post not found:", post_id);
            return res.status(404).json({ error: "Post not found" });
        }

        const existingSave = await SavedPost.findOne({ where: { user_id, post_id } });
        if (existingSave) {
            console.log("⚠️ Post already saved");
            return res.status(400).json({ error: "Post is already saved by this user" });
        }

        const result = await SavedPost.create({ user_id, post_id });
        console.log("✅ Post saved:", result);

        return res.status(201).json({ message: "Post saved successfully" });

    } catch (error) {
        console.error("🔥 SavePost error:", error); // full error
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};
const UnsavePost = async (req, res) => {
    try {
        const { userId, postId } = req.body;

        if (!userId || !postId) {
            return res.status(400).json({ error: "userId and postId are required" });
        }

        const savedPost = await SavedPost.findOne({ where: { user_id: userId, post_id: postId } });
        if (!savedPost) {
            return res.status(404).json({ error: "Saved post not found" });
        }

        await SavedPost.destroy({ where: { user_id: userId, post_id: postId } });

        return res.status(200).json({ message: "Post unsaved successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

const GetSavedPosts = async (req, res) => {
    try {
        const userID = req.query.user_id;

        if (!userID) {
            return res.status(400).json({ error: "user_id cannot be null" });
        }

        const savedPosts = await SavedPost.findAll({
            where: { user_id: userID },
            include: [{
                model: Post,
                as: 'post' // must match the alias used in association
            }]
        });

        return res.status(200).json({ saved_posts: savedPosts });
    } catch (err) {
        return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
};

// ✅ Export all functions here
export { SavePost, UnsavePost, GetSavedPosts };
