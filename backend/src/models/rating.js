import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Rating = sequelize.define(
    "Rating",
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
        score: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        tableName: "ratings",
        timestamps: false,
    }
)

export default Rating;
