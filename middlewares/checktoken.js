const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const jwt = require("jsonwebtoken")

function checktoken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if (!token) {
        return res.status(401).json({"message": "Você não tem acesso à essa página. Confirme sua identidade antes de prosseguir!"})
    }

    try {
        const secret = process.env.SECRET

        // Na verificação do token deve ser passado o token e o secret, e tem a função de callback que retorna os dados internos do JWT.
        jwt.verify(token, secret, (err, decoded) => {
            if (err) return res.status(500).json({"message": "Token inválido!"})

            // Salva o id do usuário que está no token para comparar com o que foi enviado na requisição
            req.userId = decoded.id
            next()
        })
        
    } catch (err) {
        console.warn(err)
        return res.status(500).json({"message": "Token inválido!"})
    }
}

module.exports = checktoken