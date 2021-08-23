




const httpBase =require('./http.config');

const LOGIN_SERVER_URI = `http://localhost:4001`;
const PRODUCT_SERVER_URI = `http://localhost:4003`;
const loginServerURL = httpBase(LOGIN_SERVER_URI);
const productServerURL = httpBase(PRODUCT_SERVER_URI);


module.exports = {

    getProducts: function () {
        return loginServerURL.get(`/products`);
    },
    createProduct: function (data, headers) {
        return productServerURL.post(`/product`, data, { headers: {...headers}});
    },
    authenticateUser: function (user) {
        return loginServerURL.post(`/authenticate-user/`,  user)
        .then(response => {
            return response.data
        })
        .then(data => {
            return data    
        })
    },

}