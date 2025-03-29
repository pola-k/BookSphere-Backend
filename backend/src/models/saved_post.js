import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const SavedPosts = sequelize.define(
    "SavedPosts",
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
        post_id: {
            type: DataTypes.UUID,
            allowNull: false,
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

export default SavedPosts;
