import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Rating = sequelize.define(
    "Rating",
    {
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
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
            primaryKey: true,
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        tableName: "ratings",
        timestamps: false,
    }
);

export default Rating;