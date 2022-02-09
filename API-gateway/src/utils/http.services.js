




const httpBase = require('./http.config');

const LOGIN_SERVER_URI = `http://localhost:4001`;
const PRODUCT_SERVER_URI = `http://localhost:4003`;
const DATA_MERGER_SERVER_URI = `http://localhost:4002`;
const loginServerURL = httpBase(LOGIN_SERVER_URI);
const productServerURL = httpBase(PRODUCT_SERVER_URI);
const dataMergerServerURL = httpBase(DATA_MERGER_SERVER_URI);


module.exports = {

    signupUser: async function (signupDetails) {
        // return loginServerURL.get(`/products`);
        const singupResponse = await loginServerURL.post(`/signup`, signupDetails );
        const data = singupResponse.data;
        return data;
    },

    loginUser: async function (loginDetails) {
        // return loginServerURL.get(`/products`);
        const loginResponse = await loginServerURL.post(`/login`, loginDetails);
        const data = loginResponse.data;
        return data;
    },

    getProducts: async function () {
        // return loginServerURL.get(`/products`);
        const productsResponse = await dataMergerServerURL.get(`/products`);
        const data = productsResponse.data;
        return data;
    },
    createProduct: async function (data, headers) {
        const createdProductResponse = await productServerURL.post(`/product`, data, { headers: {...headers}});
        const createdProductResponseData = createdProductResponse.data;
        return createdProductResponseData;
    },
    authenticateUser: async function (user) {
        const response = await loginServerURL.post(`/authenticate-user/`, user);
        const data = response.data;
        return data;
    },
    getUserNotifications: async function (user) {
        const response = await loginServerURL.get(`/notifications/${user.id}/${user.userEmail}`);
        const data = response.data;
        return data
    },

}