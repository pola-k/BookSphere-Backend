import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const BooksList = sequelize.define(
    "BooksList",
    {
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        book_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "books_list",
        timestamps: false,
    }
)

export default BooksList;
