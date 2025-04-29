import Rating from "../models/rating.js";
import assoications from "../models/assoications.js";

export const getRating = async (req, res) => 
{
    try 
    {
        const userId = req.user.id;
        const bookId = req.book.id;
        const rating = await Rating.findOne({ where: { userId, bookId } });
        if (!rating) 
        {
            return res.status(404).json({ score: 0 });
        }
        return res.json(rating);
    }
    catch
    {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateRating = async (req, res) => {
    try 
    {
        const userId = req.user.id;
        const bookId = req.book.id;
        const { score } = req.body;
        const [rating, created] = await Rating.upsert({
            userId,
            bookId,
            score
        });
        if (created) 
        {
            return res.status(201).json(rating);
        }
        return res.status(200).json(rating);
    }
    catch
    {
        return res.status(500).json({ message: "Internal server error" });
    }
}