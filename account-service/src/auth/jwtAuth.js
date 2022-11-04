
const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (req, res, next) => {
    const JWT_SECRET = config.secret.jwtSecret;
    const token = req.body['x-access-token'] || req.query['x-access-token'] || req.headers['x-access-token'];

    function verifyToken() {
        jwt.verify(token, JWT_SECRET, function (err, decoded) {
            if (err) {
               res.send({status: 403, success: false,  message: 'Failed to authenticate token.'});
               return res.status(403);
            } 

            req.decoded = decoded;
            next();
        });
    }

    function tokenNotPriveded() {
        res.send({status: 401, success: false, message: 'No token provided.'});
        return res.status(401);
    }

    if (token) {
        verifyToken();
    } else {
        tokenNotPriveded();
    }
}