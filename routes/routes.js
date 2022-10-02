const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Models
const User = require("../models/User")

// Middlewares
const checktoken = require("../middlewares/checktoken")

// Rota Root
router.get("/", (req, res) => {
    res.status(200).json({"message": "Hello world!"})
})

// Rota de registro
router.post("/auth/register", async (req, res) => {
    const {name, email, password, confirmpassword} = req.body

    // Validações
    let verify = !name || !email || !password || !confirmpassword
    if (verify) {
        return res.status(422).json({"message": "Para realizar o cadastro você deve enviar as seguintes informações: name, email, password, confirmpassword"})
    }

    if (password !== confirmpassword) {
        return res.status(400).json({"message": "As senhas não coincidem!"})
    }

    // Verifica se o usuário já não está cadastrado
    const userExists = await User.findOne({email: email})
    if (userExists) {
        return res.status(400).json({"message": "Esse email já está cadastrado!"})
    }

    // Codificar senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // Criar o usuário
    const user = new User({
        name,
        email,
        password: passwordHash
    })

    try {

        await user.save()

    } catch (err) {
        console.warn(`Erro ao cadastrar o usuário!\nERRO: ${err}`)
        return res.status(500).json({"message": "Não foi possível realizar o cadastro!"})
    }
    return res.status(200).json({"message": "Usuário cadastrado com sucesso!"})
})

// Rota de login
router.post("/auth/login", async (req, res) => {
    const {email, password} = req.body

    // Validações
    let verify = !email || !password
    if (verify) {
        return res.status(422).json({"message": "Para fazer o login é necessário fornecer: email, password"})
    }

    // Verifica se o usuário existe
    const user = await User.findOne({email: email})
    if (!user) {
        return res.status(404).json({"message": "Esse usuário não foi encontrado!"})
    }

    // Verificar se a senha está correta
    const checkpassword = await bcrypt.compare(password, user.password)

    if (!checkpassword) {
        return res.status(401).json({"message": "Senha incorreta!"})
    }

    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id
        }, secret, {
            expiresIn: 300,
        })

        return res.status(200).json({"message": `Seja bem-vindo(a) ${user.name}`, "id": user.id, "jwt": token})

    } catch (err) {
        console.log(`Erro ao criar o JWT!\nERRO: ${err}`)
        return res.status(200).json({"message": `Houve um erro interno!`})
    }
})

// Rota Privada
router.get("/user/:id", checktoken, async (req, res) => {
    const id = req.params.id

    try {
        // Verificar se o usuário existe
        // E impede o rebebimento da senha por questão de segurança
        const user = await User.findById(id, "-password")
        if (!user) {
            return res.status(404).json({"message": "Esse usuário não foi encontrado!"})
        }

        if (req.userId != id) {
            return res.status(401).json({"message": "Esse token não pertence à essa conta!"})
        }

        return res.status(200).json({user})
    } catch (err) {
        return res.status(404).json({"message": "Esse id é inválido!"})
    }
})

module.exports = router