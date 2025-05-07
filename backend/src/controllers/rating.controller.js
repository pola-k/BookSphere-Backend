import Rating from "../models/rating.js";

export const getRating = async (req, res) => {
    try 
    {
        const user_id = req.query.user_id;
        const book_id = req.query.book_id;
        const rating = await Rating.findOne({ where: { user_id, book_id } });

        if (rating === null) 
        {
            return res.status(200).json({ score: 0 });
        }

        return res.status(200).json({ score: rating.score });
    } 
    catch (err) 
    {
        console.error("Get rating error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateRating = async (req, res) => {
    try 
    {
        const { user_id, book_id, score } = req.body;

        const [rating, created] = await Rating.upsert(
            { user_id, book_id, score },
            { returning: true }
        );

        return res.status(created ? 201 : 200).json({ score: rating.score });
    } 
    catch (err) 
    {
        console.error("Update rating error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateRatingStats = async (req, res) => {
    try 
    {
        const book_id = req.query.book_id;
        const ratings = await Rating.findAll({ where: { book_id } });
        const totalRating = ratings.reduce((acc, rating) => acc + (Number(rating.score) || 0), 0);
        const averageRating = ratings.length ? totalRating / ratings.length : 0;

        return res.status(200).json({ averageRating , ratingCount: ratings.length });
    } 
    catch (err) 
    {
        console.error("Update rating stats error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
