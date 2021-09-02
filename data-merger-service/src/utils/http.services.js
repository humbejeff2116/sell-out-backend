




const httpBase =require('./http.config');

const LOGIN_SERVER_URI = `http://localhost:4001`;
const PRODUCT_SERVER_URI = `http://localhost:4003`;
const AccountServerURL = httpBase(LOGIN_SERVER_URI);
const productServerURL = httpBase(PRODUCT_SERVER_URI);


module.exports = {

  getProducts : async function () {
    const productsResponse = await productServerURL.get(`/products`);
    const responseData = productsResponse.data;
    const {data} = responseData;
    return data; 
  },
  getUsers : async function () {
    const usersResponse = await AccountServerURL.get(`/users`);
    const responseData = usersResponse.data;
    const { data } = responseData;
    return data; 
  },
   
}