


const { getProducts } = require('../../utils/http.services')
const User = require('../../models/userModel');
const config = require('../../config/config');


function ProductsController() {
    
}




ProductsController.prototype.getProducts = async function(req, res) {
    console.log("getting products http")
    getProducts(req)
    .then(response => {
        
        return response.data;
    })
    .then(data => {
        console.log("http products data is", data)
        res.json(data);
    })
    .catch(err => console.error(err.stack))
}

module.exports = ProductsController;