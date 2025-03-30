import Comment from "../models/comment.js";

const GetComments = async (request, response) => {

    try {
        const postID = request.query.post_id

        if (!postID){
            return response.status(404).json({ error: "post_id cannot be null" });
        }

        const comments_list = await Comment.findAll(
            {
                where: {post_id: postID}
            }
        )

        return response.status(200).json({ comments: comments_list })

    } catch (err){

        return response.status(500).json({ error: err.message || "Internal Server Error" });
    }
}

const CreateComment = async (request, response) => {

    try {
        const { user_id, post_id, parent_id, text } = request.body;

        if (!user_id)
            return response.status(400).json("user_id cannot be null")
        if (!post_id)
            return response.status(400).json("post_id cannot be null")
        if (!text)
            return response.status(400).json("text cannot be null")

        const new_comment = await Comment.create(
            {
                user_id,
                post_id,
                parent_id,   // default value may be set to NULL
                text,
            }
        );

        return response.status(201).json("Comment Created Successfully")

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });    
    }
}

const DeleteComment = async (request, response) => {

    try {
        const commentID = request.query.comment_id

        if (!commentID){
            return response.status(404).json({ error: "comment_id cannot be null" });
        }

        const comment = await Comment.findByPk(commentID);

        if (!comment) {
            return response.status(404).json({ error: "Comment Not Found" })
        }

        return response.status(200).json({ message: "Comment Deleted Successfully"})

    } catch (err){
        
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
        return response.status(200).json("Comment Updated Successfully")

    } catch (err) {

        return response.status(500).json({ error: err.message || "Internal Server Error" });    
    }
}

export { GetComments, CreateComment, DeleteComment, EditComment }