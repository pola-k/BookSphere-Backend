import { Sequelize } from "sequelize"
import Book from "../models/book.js"
import List from "../models/books_list.js"
import associations from "../models/associations.js"

export const getUserList = async (req, res) => {
    try {
        const userId = req.query.user_id;
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        const booksListEntries = await List.findAll({
            where: { user_id: userId },
            limit: limit,
            offset: offset,
            attributes: ['book_id']
        });

        const bookIds = booksListEntries.map(entry => entry.book_id);
        const books = await Book.findAll({
            where: {
                id: bookIds
            }
        });

        return res.status(200).json(books);
    }
    catch (err) {
        console.error("Get user list error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addBookToList = async (req, res) => {
    try {
        const { user_id, book_id } = req.body;
        console.log(user_id, book_id);

        const new_record = await List.create({
            user_id: user_id,
            book_id: book_id
        });

        return res.status(201).json(new_record);
    }
    catch {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const removeBookFromList = async (req, res) => {
    try {
        const userId = req.query.user_id;
        const bookId = req.query.book_id;

        const list = await List.findOne({
            where: { user_id: userId, book_id: bookId }
        });

        if (!list) {
            return res.status(404).json({ status: "false" });
        }

        await list.destroy();
        return res.status(200).json({ status: "true" });
    }
    catch {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const CheckBookStatus = async (req, res) => {
    try {
        const userId = req.query.user_id;
        const bookId = req.query.book_id;

        const list = await List.findOne({
            where: { user_id: userId, book_id: bookId }
        });

        if (list) {
            return res.status(200).json({ status: "true" });
        }
        else {
            return res.status(200).json({ status: "false" });
        }
    }
    catch {
        return res.status(500).json({ message: "Internal server error" });
    }
}