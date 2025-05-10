import Comment from "../models/comment.js";
import User from "../models/user.js";
import CommentLikes from "../models/comment_likes.js";

// const GetComments = async (request, response) => {

//     const userID = request.query.user_id;
//     const postID = request.query.post_id;

//     async function appendCommentDetails(comment) {

//         // Append Replies
//         let comment_obj = comment;
//         const replies = await Comment.findAll(
//             {
//                 where: { parent_id: comment.id },
//             }
//         );
//         comment_obj.setDataValue("replies", replies);
//         console.log("replies", replies)

//         // Append username
//         const user = await User.findByPk(comment.user_id);
//         comment_obj.setDataValue("username", user.username);

//         // Append likes_count
//         const count = await CommentLikes.count(
//             {
//                 where: { comment_id: comment.id }
//             }
//         );
//         comment_obj.setDataValue("likes_count", count);

//         // Append liked_flag
//         const liked_flag = await CommentLikes.findOne(
//             {
//                 where: {
//                     user_id: userID,
//                     comment_id: comment.id,
//                 }
//             }
//         );

//         if (liked_flag)
//             comment_obj.setDataValue("liked", true);
//         else
//             comment_obj.setDataValue("liked", false);

//         // Fetch Details of all replies
//         if (Array.isArray(comment_obj.replies) && comment_obj.replies.length > 0) {

//             let comment_replies = await Promise.all(
//                 comment_obj.replies.map(reply => appendCommentDetails(reply))
//             );

//             comment_obj.replies = comment_replies;
//         }

//         return comment_obj;
//     }

//     try {

//         if (!postID) {
//             return response.status(404).json({ error: "post_id cannot be null" });
//         }

//         let comments_list = await Comment.findAll(
//             {
//                 where: { post_id: postID }
//             }
//         )

//         if (comments_list.length > 0) {

//             comments_list = await Promise.all(
//                 comments_list.map(async comment => appendCommentDetails(comment))
//             );
//         }

//         return response.status(200).json({ comments: comments_list })

//     } catch (err) {

//         return response.status(500).json({ error: err.message || "Internal Server Error" });
//     }
// }

const GetComments = async (request, response) => {
    try {
        const postID = request.query.post_id;
        const currentUserID = request.query.user_id;

        if (!postID) {
            return response.status(400).json({ error: "post_id cannot be null" });
        }

        // Step 1: Fetch all comments for the post
        let comments = await Comment.findAll({
            where: { post_id: postID },
            raw: true,
        });

        // Step 2: Fetch all comment likes in one go
        const allLikes = await CommentLikes.findAll({
            where: { comment_id: comments.map(c => c.id) },
            raw: true,
        });

        // Step 3: Fetch all users in one go
        const users = await User.findAll({
            where: { id: [...new Set(comments.map(c => c.user_id))] },
            raw: true,
        });

        const userMap = new Map(users.map(u => [u.id, u.username]));

        // Step 4: Group comments by parent_id
        const commentMap = new Map();
        for (let comment of comments) {
            comment.replies = [];
            comment.username = userMap.get(comment.user_id) || "Unknown";
            comment.likes_count = allLikes.filter(like => like.comment_id === comment.id).length;
            comment.liked = !!allLikes.find(like =>
                like.comment_id === comment.id && like.user_id === currentUserID
            );

            commentMap.set(comment.id, comment);
        }

        // Step 5: Build tree using parent-child mapping
        const roots = [];
        for (let comment of comments) {
            if (comment.parent_id === 0 || comment.parent_id === null) {
                roots.push(comment);
            } else {
                const parent = commentMap.get(comment.parent_id);
                if (parent) {
                    parent.replies.push(comment);
                }
            }
        }

        return response.status(200).json({ comments: roots });

    } catch (err) {
        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
};


const CreateComment = async (request, response) => {

    try {
        const { user_id, post_id, parent_id, text } = request.body;

        if (!user_id)
            return response.status(400).json("user_id cannot be null")
        if (!post_id)
            return response.status(400).json("post_id cannot be null")
        if (!text)
            return response.status(400).json("text cannot be null")

        let new_comment = await Comment.create(
            {
                user_id,
                post_id,
                parent_id,   // default value may be set to NULL
                text,
            }
        );

        const user = await User.findByPk(user_id);
        new_comment.setDataValue("username", user.username);
        new_comment.setDataValue("replies", [])

        return response.status(201).json({ message: "Comment Created Successfully", comment: new_comment })

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const DeleteComment = async (request, response) => {

    try {
        const commentID = request.query.comment_id

        if (!commentID) {
            return response.status(404).json({ error: "comment_id cannot be null" });
        }

        const comment = await Comment.findByPk(commentID);

        if (!comment) {
            return response.status(404).json({ error: "Comment Not Found" })
        }

        await comment.destroy()
        return response.status(200).json({ message: "Comment Deleted Successfully" })

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const EditComment = async (request, response) => {

    try {
        const commentID = request.body.comment_id;
        const text = request.body.text;

        if (!commentID)
            return response.status(400).json("comment_id cannot be null")
        if (!text)
            return response.status(400).json("comment cannot be null")

        const comment = await Comment.findByPk(commentID);

        if (!comment)
            return response.status(400).json("Comment Not Found")

        await comment.update({ text })
        return response.status(200).json({ message: "Comment Updated Successfully", text: comment.text})

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const ToggleCommentLike = async (request, response) => {

    const userID = request.body.user_id;
    const commentID = request.body.comment_id;

    try {
        const comment_like = await CommentLikes.findOne(
            {
                where: { user_id: userID, comment_id: commentID }
            }
        );

        if (!comment_like) {
            const like_comment = await CommentLikes.create(
                {
                    user_id: userID,
                    comment_id: commentID,
                }
            );

            return response.status(201).json({ message: `Comment ${commentID} Liked By User ${userID}` })
        }

        else {

            await comment_like.destroy()
            return response.status(200).json({ message: `Comment ${commentID} Unliked By User ${userID}` })
        }

    } catch (error) {
        return response.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

export { GetComments, CreateComment, DeleteComment, EditComment, ToggleCommentLike }