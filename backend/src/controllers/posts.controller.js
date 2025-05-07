import Post from "../models/post.js"
import PostLikes from "../models/post_likes.js"
import User from "../models/user.js"
import SavedPost from "../models/saved_post.js"
import { s3 } from "../index.js"
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs"
import path from "path"



const GetSinglePost = async (request, response) => { // user's posts for profile && recommended posts on homepage --> 'type' key in request

    try {

        const post_id = request.query.post_id
        const user_id = request.query.user_id
        let fetched_post = await Post.findByPk(post_id);

        if (fetched_post) {

            if (Array.isArray(fetched_post.media) && fetched_post.media.length > 0) {

                const signed_urls = await Promise.all(
                    fetched_post.media.map(async (mediaFile) => {

                        const command = new GetObjectCommand({
                            Bucket: process.env.R2_BUCKET_NAME,
                            Key: mediaFile,
                        });

                        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
                        return signedUrl;
                    })
                );

                fetched_post.media = signed_urls;
            }

            const user = await User.findByPk(fetched_post.user_id);
            fetched_post.setDataValue("username", user.username);

            const { count, rows: post_likes_list } = await PostLikes.findAndCountAll(
                {
                    where: { post_id: fetched_post.id }
                }
            );

            if (count > 0)
                fetched_post.setDataValue("liked", true);
            else
                fetched_post.setDataValue("liked", false);

            fetched_post.setDataValue("likes_count", count);


            const saved_flag = await SavedPost.findOne(
                {
                    where:
                    {
                        user_id: user_id,
                        post_id: fetched_post.id
                    }
                }
            );

            if (saved_flag)
                fetched_post.setDataValue("isSaved", true);
            else
                fetched_post.setDataValue("isSaved", false);

            return fetched_post;
        }

        // console.log("SINGLE POSTS", fetched_posts);
        return response.status(200).json({ posts: fetched_posts });

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const GetPosts = async (request, response) => { // user's posts for profile && recommended posts on homepage --> 'type' key in request

    try {
        const userID = request.query.user_id
        const type = request.query.type
        const page = parseInt(request.query.page) || 1
        const limit = parseInt(request.query.limit) || 10
        const offset = (page - 1) * limit

        if (!type) {
            return response.status(404).json({ error: "type of posts cannot be null" });
        }

        let fetched_posts = []

        if (type === "user") {

            if (!userID)
                return response.status(404).json({ error: "user_id cannot be null" });

            const { count, rows: posts_list } = await Post.findAndCountAll(
                {
                    limit: limit,
                    offset: offset,
                    where: { user_id: userID }
                }
            );

            fetched_posts = posts_list;
        }

        else if (type === "home") {

            const { count, rows: posts_list } = await Post.findAndCountAll(
                {
                    limit: limit,
                    offset: offset,
                }
            );

            fetched_posts = posts_list;
        }

        else
            return response.status(404).json({ error: "Invalid type of posts" });

        if (fetched_posts.length > 0) {

            fetched_posts = await Promise.all(
                fetched_posts.map(async (post) => {

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

                    const count = await PostLikes.count(
                        {
                            where: { post_id: post.id }
                        }
                    );
                    post_obj.setDataValue("likes_count", count);

                    const liked_flag = await PostLikes.findOne(
                        {
                            where: {
                                user_id: userID,
                                post_id: post.id,
                            }
                        }
                    );

                    if (liked_flag)
                        post_obj.setDataValue("liked", true);
                    else
                        post_obj.setDataValue("liked", false);


                    const saved_flag = await SavedPost.findOne(
                        {
                            where:
                            {
                                user_id: userID,
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

        // console.log("FINAL POSTS", fetched_posts);
        return response.status(200).json({ posts: fetched_posts });

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const DeletePost = async (request, response) => {

    const deleteFileFromR2 = async (filePath) => {

        const deleteParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filePath,
        };

        try {
            const command = new DeleteObjectCommand(deleteParams);
            await s3.send(command);

        } catch (deleteErr) {
            console.error(`ERROR: Failed to delete file from R2 during Post Deletion.`, deleteErr);
        }
    };

    try {
        const userID = request.query.user_id;
        const postID = request.query.post_id;

        if (!postID) {
            return response.status(404).json({ error: "post_id cannot be null" });
        }

        const post = await Post.findByPk(postID);

        if (!post) {
            return response.status(404).json({ error: "Post Not Found" })
        }

        if (post.user_id != userID)
            return response.status(403).json("Unauthorized Access. Only Post Author May Delete Their Post")

        // delete files from R2
        if (post.media.length > 0)
            await Promise.allSettled(post.media.map(filePath => deleteFileFromR2(filePath)));

        await post.destroy()
        return response.status(200).json({ message: "Post Deleted Successfully" })

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const CreateTextPost = async (request, response) => {

    try {
        const { user_id, title, description } = request.body;

        if (!user_id)
            return response.status(400).json("user_id cannot be null")
        if (!title)
            return response.status(400).json("title cannot be null")
        if (!description)
            return response.status(400).json("description cannot be null")

        const new_post = await Post.create(
            {
                user_id,
                title,
                description,
            }
        );

        return response.status(201).json("Text Post Created Successfully")

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const FAILED_DELETIONS_LOG_FILE = path.join(process.cwd(), 'failed_deletions_R2.log');
function logFailedDeletion(key) {
    if (!key) return;
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${key}\n`;

    try {
        fs.appendFileSync(FAILED_DELETIONS_LOG_FILE, logEntry, 'utf8');

    } catch (writeErr) {
        console.error(`[CreateMediaPost] FATAL: Could not write failed key (${key}) to log file (${FAILED_DELETIONS_LOG_FILE}):`, writeErr);
    }
}

const CreateMediaPost = async (request, response) => {

    const logPrefix = "[CreateMediaPost]";
    let uploadedFilenames = [];
    console.log("Request Format for Create-Media-Post: ", request.body, "\n", request.files)

    try {
        const { user_id, title, description } = request.body;
        const files = request.files;

        if (!user_id) {
            return response.status(400).json({ message: "user_id cannot be null" });
        }
        if (!title) {
            return response.status(400).json({ message: "title cannot be null" });
        }
        if (!files || files.length === 0) {
            return response.status(400).json({ message: "media cannot be null" });
        }

        const uploadFile = async (file) => {

            const uploadParams = {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: file.filename,
                Body: fs.createReadStream(file.path),
                ContentType: file.mimetype
            };

            try {
                const command = new PutObjectCommand(uploadParams);
                await s3.send(command);
                uploadedFilenames.push(file.filename);

                // Clean up local file after successful R2 upload
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error(`ERROR: Error deleting temporary file: ${file.path}`, err);
                    } else {
                        console.info(`INFO: Successfully deleted temporary file: ${file.path}`);
                    }
                });

                return file.filename;

            } catch (uploadErr) {
                console.error(`ERROR: Failed to upload to R2. Key: ${file.filename}`, uploadErr);

                // Attempt to clean up local file even on upload failure
                fs.unlink(file.path, (err) => {
                    if (err) console.error(`${uploadLogPrefix} ERROR: Error deleting temporary file after R2 upload failure: ${file.path}`, err);
                });
                // Re-throw the error to be caught by Promise.all
                throw uploadErr;
            }
        };

        await Promise.all(files.map(file => uploadFile(file)));

        try {
            const new_post = await Post.create({
                user_id,
                title,
                description,
                media: uploadedFilenames
            });

            return response.status(201).json({ message: "Media Post Created Successfully", postId: new_post.id });

        } catch (dbErr) {

            // Rollback R2 Uploads

            const deleteFileFromR2 = async (filePath) => {

                const deleteParams = {
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: filePath,
                };

                try {
                    const command = new DeleteObjectCommand(deleteParams);
                    await s3.send(command);

                } catch (deleteErr) {
                    console.error(`ERROR: Failed to delete from R2 during rollback.`, deleteErr);
                    logFailedDeletion(filePath);
                }
            };

            // Attempt to delete all successfully uploaded files
            const deleteResults = await Promise.allSettled(uploadedFilenames.map(filePath => deleteFileFromR2(filePath)));

            return response.status(500).json({ message: "Post Creation Unsuccessful. Could Not Save Post Data. Please Try Again" });
        }

    } catch (err) {

        // Logging all files uploaded to R2 till the error occurence
        uploadedFilenames.forEach(file_path => {
            logFailedDeletion(file_path);
        })
        console.error(`${logPrefix} ERROR: State at time of error - Uploaded filenames tracked: [${uploadedFilenames.join(', ')}]`);

        return response.status(500).json({ message: err.message || "Internal Server Error" });
    }
}

const TogglePostLike = async (request, response) => {

    const userID = request.body.user_id;
    const postID = request.body.post_id;

    try {
        const post_like = await PostLikes.findOne(
            {
                where: { user_id: userID, post_id: postID }
            }
        );

        if (!post_like) {
            const like_post = await PostLikes.create(
                {
                    user_id: userID,
                    post_id: postID,
                }
            );

            return response.status(201).json({ message: `Post ${postID} Liked By User ${userID}` })
        }

        else {

            await post_like.destroy()
            return response.status(200).json({ message: `Post ${postID} Unliked By User ${userID}` })
        }

    } catch (error) {
        return response.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

export { GetSinglePost, GetPosts, CreateTextPost, CreateMediaPost, DeletePost, TogglePostLike }
