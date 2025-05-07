import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const CommentLikes = sequelize.define(
    "CommentLikes",
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
        comment_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "comments",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "comment_likes",
        timestamps: false,
    }
)

export default CommentLikes;