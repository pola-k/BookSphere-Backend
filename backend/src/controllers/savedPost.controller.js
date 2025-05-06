import Post from "../models/post.js"
import PostLikes from "../models/post_likes.js"
import User from "../models/user.js"
import SavedPost from "../models/saved_post.js"
import { s3 } from "../index.js"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

const GetSavedPosts = async (request, response) => { // user's posts for profile && recommended posts on homepage --> 'type' key in request

    try {
        const userID = request.query.user_id
        // const page = parseInt(request.query.page) || 1
        // const limit = parseInt(request.query.limit) || 10
        // const offset = (page - 1) * limit

        let joined_savedPosts = await SavedPost.findAll({
            where: { user_id: userID },
            include: [{
              model: Post,
              as: 'post',
              attributes: { exclude: [] } 
            }],
            attributes: [] // exclude SavedPost attributes
          });
          
        let savedPosts = joined_savedPosts.map(entry => entry.post);

        if (savedPosts.length > 0) {

            savedPosts = await Promise.all(
                savedPosts.map(async (post) => {

                    let post_obj = post;

                    if (Array.isArray(post_obj.media) && post_obj.media.length > 0) {

                        const signed_urls = await Promise.all(
                            post_obj.media.map(async (mediaFile) => {

                                const command = new GetObjectCommand({
                                    Bucket: process.env.R2_BUCKET_NAME,
                                    Key: mediaFile,
                                });

                                const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
                                return signedUrl;
                            })
                        );

                        post_obj.media = signed_urls;
                    }

                    const user = await User.findByPk(post.user_id);
                    post_obj.setDataValue("username", user.username);
                
                    const { count, rows: post_likes_list } = await PostLikes.findAndCountAll(
                        {
                            where: { post_id: post.id }
                        }
                    );

                    if (count > 0)
                        post_obj.setDataValue("liked", true);
                    else
                        post_obj.setDataValue("liked", false);

                    post_obj.setDataValue("likes_count", count);
                    

                    const saved_flag = await SavedPost.findOne(
                        {
                            where: 
                            {   user_id: userID,
                                post_id: post.id 
                            }
                        }
                    );

                    if (saved_flag)
                        post_obj.setDataValue("isSaved", true);
                    else
                        post_obj.setDataValue("isSaved", false);

                    return post_obj;
                })
            );
        }

        return response.status(200).json({ saved_posts: savedPosts });

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

export { SavePost, UnsavePost, GetSavedPosts };
