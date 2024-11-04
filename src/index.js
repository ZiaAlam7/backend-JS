// require('dotenv').config({path: './env'})
import dotenv from "dotenv"

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js"
import connectDB from "./db/index.js"

dotenv.config({
    path:'./env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`The Server is Running ar PORT: ${process.env.PORT}`)
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
import express from 'express';
const app = express()

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