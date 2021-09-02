


const { getProducts, getUsers } = require('../../utils/http.services');

function ProductsController() {
    
}

ProductsController.prototype.getProducts = async function(req, res) {
    try {
        const products = await getProducts();
        const users = await getUsers();
        return setStarsAndSendProductsToGateway(users, products, res);
        
        async function setStarsAndSendProductsToGateway(users, products, res) {
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
            return  res.status(200).json(products);   
        }
        
    } catch (err) {
        console.error(err.stack);   
    }  
}
module.exports = ProductsController;