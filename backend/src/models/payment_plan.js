import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const PaymentPlan = sequelize.define(
    "PaymentPlan",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        feature: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "payment_plans",
        timestamps: false,
    }
)

export default PaymentPlan;
