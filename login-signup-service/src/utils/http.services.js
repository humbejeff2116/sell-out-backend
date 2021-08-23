




const httpBase =require('./http.config');

const LOGIN_SERVER_URI = `http://localhost:4001`;
const PRODUCT_SERVER_URI = `http://localhost:4003`;
const loginServerURL = httpBase(LOGIN_SERVER_URI);
const productServerURL = httpBase(PRODUCT_SERVER_URI);


module.exports = {

   getProducts : function () {
    return productServerURL.get(`/products`);
  },
  createProduct : function (data, headers =`"Content-Type": "multipart/form-data"`) {
    return productServerURL.post(`/product`, data, { headers: {...headers}});
  }
  
}