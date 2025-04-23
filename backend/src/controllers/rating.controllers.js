import Rating from "../models/rating.js";

const GetRatings = async (req, res) => {
try {
    const { bookId } = req.params;
    const book = await Book.findByPk(bookId, { attributes: ['id', 'averageRating', 'ratingCount'] });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // If no ratings yet, return 0 instead of null
    res.json({ 
      bookId, 
      averageRating: book.averageRating || 0, 
      ratingCount: book.ratingCount || 0 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const SubmitRating = async (req, res) => {

   try {
    const { bookId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const book = await Book.findByPk(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Handle first rating case
    const oldRatingCount = book.ratingCount || 0;
    const oldAverageRating = book.averageRating || 0;

    // Calculate new average
    const newRatingCount = oldRatingCount + 1;
    const newAverageRating = ((oldAverageRating * oldRatingCount) + rating) / newRatingCount;

    // Update database
    book.ratingCount = newRatingCount;
    book.averageRating = newAverageRating;
    await book.save();

    res.json({ bookId, averageRating: book.averageRating, ratingCount: book.ratingCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {GetRatings , SubmitRating}
