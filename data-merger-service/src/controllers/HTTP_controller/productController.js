
const { getProducts } = require('../../utils/http.services');

function ProductsController() { }

ProductsController.prototype.getProducts = async function(req, res) {

    try {

        const products = await getProducts();
       
        res.status(200).json(products);
   
    } catch (err) {

        console.error(err); 

    }

}

module.exports = ProductsController;