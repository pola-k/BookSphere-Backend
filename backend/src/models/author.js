import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Author = sequelize.define(
    "Author",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    },
    {
        tableName: "authors",
        timestamps: false,
    }
)

export default Author;