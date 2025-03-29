import { DataTypes } from "sequelize";
import { sequelize } from "./db.js";

const Summary = sequelize.define(
    "Summary",
    {
        book_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                model: "books",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "summaries",
        timestamps: false,
    }
)

export default Summary;
