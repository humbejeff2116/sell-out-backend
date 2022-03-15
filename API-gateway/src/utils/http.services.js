
const httpBase = require('./http.config');
const LOGIN_SERVER_URI = `http://localhost:4001`;
const PRODUCT_SERVER_URI = `http://localhost:4003`;
const DATA_MERGER_SERVER_URI = `http://localhost:4002`;
const loginServerURL = httpBase(LOGIN_SERVER_URI);
const productServerURL = httpBase(PRODUCT_SERVER_URI);
const dataMergerServerURL = httpBase(DATA_MERGER_SERVER_URI);


module.exports = {

    signupUser: async function (signupDetails) {

        const singupResponse = await loginServerURL.post(`/signup`, signupDetails );
       
        return singupResponse.data;

    },

    loginUser: async function (loginDetails) {

        const loginResponse = await loginServerURL.post(`/login`, loginDetails);

        return loginResponse.data;

    },

    getProducts: async function () {

        const productsResponse = await productServerURL.get(`/products`);

        return productsResponse.data;
        
    },
    createProduct: async function (data, headers) {

        const createdProductResponse = await productServerURL.post(`/product`, data, { headers: {...headers}});

        return createdProductResponse.data;

    },
    authenticateUser: async function (user) {

        const response = await loginServerURL.post(`/authenticate-user/`, user);

        return response.data;

    },
    getUserNotifications: async function (user) {

        const response = await loginServerURL.get(`/notifications/${user.id}/${user.userEmail}`);

        return response.data;

    },
    searchProducts : async function (query) {

        const searchProductsResponse = await productServerURL.post(`/searc-products?q=${query}`);
 
        return searchProductsResponse.data;

    },
    getProductComments : async function(productId) {

        const productCommentsResponse = await productServerURL.get(`/reviews/${productId}`);

        return productCommentsResponse.data;

    },
    getUserStars : async function(userId) {

        const userStarsResponse = await loginServerURL.get(`/stars/${userId}`);
        
        return userStarsResponse.data

    },
     getProductLikes : async function(productId) {

        const productLikesResponse = await productServerURL.get(`/product-likes/${productId}`);
        
        return productLikesResponse.data

    },
    updateUser: async function(data, headers) {

        const updateUserResponse = await loginServerURL.post(`/update-user`, data, { headers: {...headers}});

        return updateUserResponse.data;

    },
     getDeliveryRegions : async function(userId) {

        const userStarsResponse = await loginServerURL.get(`/delivery-regions/${userId}`);
        
        return userStarsResponse.data

    },

}