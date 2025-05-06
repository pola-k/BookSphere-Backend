import Review from "../models/review.js";
import associations from "../models/associations.js";

export const postReview = async (req, res) => {
    try 
    {
        const { userId, bookId, review, time } = req.body;

        const newReview = await Review.create({
            user_id: userId,
            book_id: bookId,
            text: review,
            time: time,
        });

        return res.status(201).json(newReview);
    } 
    catch (error) 
    {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getReview = async (req, res) => {
    try 
    {
        const bookId = req.query.bookId;

        const reviews = await Review.findAll({
            where: { book_id: bookId },
            include: [{ model: associations.User, attributes: ["username", "image"] }],
        });

        return res.status(200).json(reviews);
    } 
    catch (error) 
    {
        return res.status(500).json({ message: "Internal server error" });
    }
}