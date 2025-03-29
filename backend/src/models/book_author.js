import { sequelize } from "./db.js";

const BookAuthor = sequelize.define(
    "BookAuthor",
    {},
    {
        tableName: "book_authors",
        timestamps: false
    }
);

export default BookAuthor;
