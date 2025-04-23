
import PaymentPlan  from "../models/payment_plan.js"

const GetPaymentPlan = async(req, res)=>{
    try{
          const plans = await PaymentPlan.findAll();
          return res.status(200).json({saved_plans : plans});
    }
 catch (error) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
}
};
export default GetPaymentPlan;