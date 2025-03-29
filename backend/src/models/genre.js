import { DataTypes } from "sequelize";
import { sequelize } from "../db";

const Genre = sequelize.define(
    "Genre",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "genres",
        timestamps: false,
    }
)

export default Genre;