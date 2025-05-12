import PaymentPlan from "../models/payment_plan.js";
import { sequelize } from "../db.js";

// Get All Payment Plans
const GetPaymentPlan = async (req, res) => {
    try {
        const plans = await PaymentPlan.findAll();
        return res.status(200).json({ saved_plans: plans });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

// Add a New Payment Plan with ID Reset to 1
const AddPaymentPlan = async (req, res) => {
    const { feature } = req.body;
    try {
        await PaymentPlan.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
        const newPlan = await PaymentPlan.create({ id: 1, feature });
        return res.status(201).json({ message: "Payment Plan Added Successfully", newPlan });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

// Delete Payment Plan by ID
const DeletePaymentPlan = async (req, res) => {
    const { id } = req.params;
    try {
        await PaymentPlan.destroy({ where: { id } });
        return res.status(200).json({ message: "Payment Plan Deleted Successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export { GetPaymentPlan, AddPaymentPlan, DeletePaymentPlan };