const jwt = require ('jsonwebtoken')
const { token } = require ('morgan')

const config = 'kkjkjkj';

module.exports =  {
    creteToken : (token) => {
        return jwt.sign(token, config )
    },
    confirmJwt : (token) => {
        try{
            return jwt.verify(token, config)
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new Error ('Token is expired')
            } else {
                throw new Error  ('Invalid Token')
            }
        }
    }
}