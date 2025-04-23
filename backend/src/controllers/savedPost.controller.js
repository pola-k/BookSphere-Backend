import SavedPost from "../models/saved_post.js"; 
import Post from "../models/post.js";
import User from "../models/user.js";

 const SavePost = async (req, res) => {
    try {
        const { user_id, post_id } = req.body;

        // Validate request body
        if (!user_id || !post_id) {
            return res.status(400).json({ error: "user_id and post_id are required" });
        }

        // Check if the user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the post exists
        const post = await Post.findByPk(post_id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the post is already saved by the user
        const existingSave = await SavedPost.findOne({ where: { user_id, post_id } });
        if (existingSave) {
            return res.status(400).json({ error: "Post is already saved by this user" });
        }

        // Save the post
        await SavedPost.create({ user_id, post_id });

        return res.status(201).json({ message: "Post saved successfully" });
    } catch (error) {
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
export default UnsavePost;
const GetSavedPosts = async (request, response) => {
    try {
        const userID = request.query.user_id;

        if (!userID) {
            return response.status(400).json({ error: "user_id cannot be null" });
        }

        const savedPosts = await SavedPost.findAll();

        return response.status(200).json({ saved_posts: savedPosts });
    } catch (err) {
        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
};

