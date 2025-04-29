import { Sequelize} from "sequelize"
import Book from "../models/Book.js"
import List from "../models/books_list.js"
import assoications from "../models/assoications.js"

export const getUserList = async (req, res) => {
    try 
    {
        const userId = req.user.id;

        const lists = await List.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Book,
                    through: { attributes: [] }
                }
            ]
        });

        if (lists.length === 0) 
        {
            return res.status(404).json({ message: "No lists found for this user" });
        }

        return res.status(200).json(lists);
    }
    catch
    {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addBookToList = async (req, res) => {
    try 
    {
        const user_id = req.user.id;
        const book_id = req.book.id;

        const new_record = await List.create({
            user_id: user_id,
            book_id: book_id
        });

        return res.status(201).json(new_record);
    }
    catch
    {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const removeBookFromList = async (req, res) => 
{
    try
    {
        const userId = req.user.id;
        const bookId = req.book.id;

        const list = await List.findOne({
            where: { user_id: userId, book_id: bookId }
        });
        
        if (!list) 
        {
            return res.status(404).json({ message: "Book not found in list" });
        }

        await list.destroy();
        return res.status(200).json({ message: "Book removed from list" });
    }
    catch
    {
        return res.status(500).json({ message: "Internal server error" });
    }
}