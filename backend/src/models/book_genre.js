import { INTEGER } from "sequelize";
import { sequelize } from "../db.js";
import { DataTypes } from "sequelize";

const BookGenre = sequelize.define(
    "BookGenre",
    {
        BookId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: "books",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
        },
        GenreId: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: "genres",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        }
    },
    {
        tableName: "book_genres",
        timestamps: false
    }
);

export default BookGenre;
