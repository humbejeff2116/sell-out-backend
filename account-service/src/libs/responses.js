
module.exports = {
    sendJSONError(res, status, errorExist, message, error) {
        const response = {
            status,
            error: errorExist, 
            message, 
        }
    
        res.json(response); 
        return res.status(500);
    }
}