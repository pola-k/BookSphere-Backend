import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Comment = sequelize.define(
    "Comment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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
        parent_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "comments",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        date_created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "comments",
        timestamps: false
    }
)

export default Comment;