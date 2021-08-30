



const axios = require('axios');

module.exports = function http(URI) {
    return axios.create({
        baseURL:`${URI}/api/v1`,
        headers:{
            "content-type":"application/json"
        }
    });
}