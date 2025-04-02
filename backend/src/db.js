import { Sequelize } from "sequelize";
import { S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000, // Timeout for acquiring connection
        idle: 10000 // Timeout before releasing idle connection
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Use `false` if your certificate isn't verified
        }
    }
});

sequelize.authenticate()
    .then(() => console.log("✅ Sequelize Connected"))
    .catch(err => console.error("❌ Sequelize Connection Error:", err));


const s3 = new S3({
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
    region: "auto",
});

const testConnection = async () => {
    try {
        const response = await s3.listBuckets();
        console.log("✅ Connection successful! Buckets:", response.Buckets);
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
    }
};

testConnection();

export { sequelize, s3 };
