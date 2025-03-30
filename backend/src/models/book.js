import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Book = sequelize.define(
    "Book",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        author_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "authors",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        publish_date: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        abstract: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isbn: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        publisher: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        no_pages: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "books",
        timestamps: false,
    }
);

export default Book;