import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const PostLikes = sequelize.define(
    "PostLikes",
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
        tableName: "post_likes",
        timestamps: false,
    }
)

export default PostLikes;