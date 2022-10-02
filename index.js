const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const express = require("express")
const mongoose = require("mongoose")

const router = require("./routes/routes")

const api = express()
api.use(express.json())
const PORT = process.env.PORT || 8081

api.use("/", router)

// Credenciais
const USER = process.env.DB_USER
const PASS = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${USER}:${PASS}@cluster0.u6ptk5s.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    api.listen(PORT, () => {
        console.log(`Servidor rodando na URL "http://localhost:${PORT}"`)
    })
}).catch((err) => console.log(err))
