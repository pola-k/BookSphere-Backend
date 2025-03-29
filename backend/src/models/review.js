import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Review = sequelize.define(
    "Review",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
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
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "reviews",
        timestamps: false,
    }
)

export default Review;
