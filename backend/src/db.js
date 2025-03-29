import pkg from 'pg'
const { Pool } = pkg;
import { Sequelize } from "sequelize";
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

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

sequelize.authenticate()
    .then(() => console.log("✅ Sequelize Connected"))
    .catch(err => console.error("❌ Sequelize Connection Error:", err));

pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("❌ Pool Connection Error:", err);
    } else {
        console.log("✅ Pool Connected - Time:", res.rows[0].now);
    }
});

export { sequelize, pool };
