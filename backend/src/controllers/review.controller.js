import Review from "../models/review.js";
import assoications from "../models/associations.js";

export const postReview = async (req, res) => {
    try 
    {
        const { bookId, review } = req.body;
        const userId = req.user.id;

        const newReview = await Review.create({
            user_id: userId,
            book_id: bookId,
            text: review,
        });

        return res.status(201).json(newReview);
    } 
    catch (error) 
    {
        return res.status(500).json({ message: "Internal server error" });
    }
}