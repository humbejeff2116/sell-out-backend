


const { getProducts, createProduct } = require('../../utils/http.services');
const formidable = require('formidable');
const User = require('../../models/userModel');
const config = require('../../config/config');


function ProductsController() { }


ProductsController.prototype.getProducts = async function(req, res) {
    
    getProducts(req.body)
    .then(response => { 
        return response.data;
    })
    .then(productsData => {

        const { data } = productsData;
        return setStarsAndSendProductsToGateway(User, data, res);
        
        async function setStarsAndSendProductsToGateway(User, products, res) {
            const users =  await User.getAllUsers();
            const usersStars =  users.map(user => ({ 
                userEmail: user.userEmail,
                starsUserRecieved: user.starsUserRecieved
            }));
            for (i = 0; i < products.length; i++) {
                for (j = 0; j < usersStars.length; j++) {
                    if (products[i].userEmail === usersStars[j].userEmail) {
                        products[i].starsUserRecieved = usersStars[j].starsUserRecieved;
                    }
                }
            }
            return  res.status(201).json(products);   
        }
    })
    .catch(err => console.error(err.stack));
}

module.exports = ProductsController;