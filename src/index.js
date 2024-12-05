// require('dotenv').config({path: './env'})
import dotenv from "dotenv"

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js"
import express from 'express';
import connectDB from "./db/index.js"
import cookieParser from 'cookie-parser'

const app = express()


app.use(express.json())
app.use(cookieParser())


import router from "./routes/user.routes.js"
app.use("/api/v1/users", router);

dotenv.config({
    path:'./env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`The Server is Running on PORT: http://localhost:${process.env.PORT}`)
    })

    app.get("/", (req,res) => {
        res.status(200).json({
            message: "the server is running on PORT 8000"
        })
    })


    app.on('ERROR', (error) => {
        console.log("Error :" , error)
        throw error
    })
})
.catch((err) => {
    console.log("MONGO db connection failed",err)
})





/*


(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('ERROR', (error) => {
            console.log("ERROR: ", error)
            throw error
        })

        app.listen(process.env.PORT, (req, res)=> {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/