import express from 'express'
import dotenv from 'dotenv'

dotenv.config();

const app = express();

const PORT = process.env.PORT

app.listen(Number(PORT), "0.0.0.0", () => {
    console.log("Server is running at port", PORT);
})