const getToken = ( req ) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null

    return token && token.length ? token : null
}

module.exports = {
    getToken
}