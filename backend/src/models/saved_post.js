import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const SavedPost = sequelize.define(
    "SavedPost",
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
        post_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "posts",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "saved_posts",
        timestamps: false,
    }
)

export default SavedPost;
