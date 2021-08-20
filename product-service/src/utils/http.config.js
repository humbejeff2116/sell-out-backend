



const axios = require('axios');

module.exports = function http(URI) {
    return axios.create({
        baseURL:`${URI}`,
        headers:{
            "content-type":"application/json"
        }
    });
}