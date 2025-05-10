import Book from "../models/book.js";
import { Op } from "sequelize";

const GetSearchResults = async (request, response) => {
    const query = request.query.query?.toLowerCase();
    const page = parseInt(request.query.page) || 1
    const limit = parseInt(request.query.limit) || 10
    const offset = (page - 1) * limit

    if (!query) {
        return response.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const matchingBooks = await Book.findAll({
            where: {
                title: { [Op.iLike]: `%${query}%` }
            },
            limit: limit,
            offset: offset,
        });

        return response.status(200).json({ books: matchingBooks });
    } catch (err) {
        return response.status(500).json({ error: 'Server error' });
    }
};

export { GetSearchResults };