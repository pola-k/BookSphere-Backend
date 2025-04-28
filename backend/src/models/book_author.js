import { sequelize } from "../db.js";
import { DataTypes } from "sequelize";

const BookAuthor = sequelize.define(
    "BookAuthor",
    {
        BookId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        AuthorId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "authors",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "book_authors",
        timestamps: false
    }
);

export default BookAuthor;
