import { sequelize } from "./db.js";

const BookGenre = sequelize.define(
    "BookGenre",
    {},
    {
        tableName: "book_genres",
        timestamps: false
    }
);

export default BookGenre;
