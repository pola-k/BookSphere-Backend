import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate:
            {
               isEmail: true,
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.TEXT,
        },
        bio: {
            type: DataTypes.TEXT,
        },
        plan_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "payment_plans",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",   // allows user to have only 1 active plan
        },
    },
    {
        tableName: "users",
        timestamps: false,
    }
);

export default User;
