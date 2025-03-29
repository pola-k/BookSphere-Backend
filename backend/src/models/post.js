import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Post = sequelize.define(
    "Post",
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
        date_created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        media: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            defaultValue: []
        },
    },
    {
        tableName: "posts",
        timestamps: false,
    }
);

export default Post;
