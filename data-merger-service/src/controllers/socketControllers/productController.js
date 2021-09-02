





/**
 * @class 
 *  products controller class 
 * @module ProductsController
 */
function ProductsController() {
    this.productClient;
    this.userClient;
    this.serverSocket; 
}

/**
 * @method mountSocket 
 ** Used to initialize the class instance variables
 * @param {object} productClient - the socket.IO client that connects to the products service
 * @param {object} userClient - the socket.IO client that connects to the account service
 * @param {object} serverSocket - the socket.IO server socket that connects from clients
 * 
 */
 ProductsController.prototype.mountSocket = function({ productClient, userClient, serverSocket}) {
    this.productClient = productClient ? productClient : null;
    this.userClient = userClient ? userClient : null;
    this.serverSocket = serverSocket ? serverSocket : null;
    return this;
}

/**
 * @method getSocketDetails  
 ** Used to get the service node socket datesils
 */
 ProductsController.prototype.getSocketDetails = function() {
    return ({
        productClient: this.productClient,
        serverSocket: this.serverSocket,
        userClient: this.userClient,
    });
}
ProductsController.prototype.getProducts = function(socketId) {
    console.log("getting products and users ----productsController---")
    this.productClient.emit("getProducts", socketId);
    this.userClient.emit("getAllUsers", socketId);
}

function setUsersAndProductsData() {
    this.users;
    this.products;
    this.usersSet = false;
    this.productsSet = false;
    this.setProducts = setProducts;
    this.setUsers = setUsers;
    this.userAndProductsDataSet = userAndProductsDataSet;
    this.setStarsAndSendProductsToGateway = setStarsAndSendProductsToGateway;
} 
function setProducts(products){
    this.products = products;
    this.productsSet = true;
    return this;
}  
function setUsers(users) {
    this.users = users;
    this.usersSet = true;
    return this;
}
function userAndProductsDataSet() {
    if(this.usersSet && this.productsSet) {
        this.usersSet = false;  
        this.productsSet = false;
        return true;
    }
    return false;
}
async function setStarsAndSendProductsToGateway( socketId, io) {
    const usersStars =  this.users.map(user => ({ 
        userEmail: user.userEmail,
        starsUserRecieved: user.starsUserRecieved
    }));
    const response = {
        socketId: socketId,
        data: null,
        message:"gotten products data successfully"
    }
    for (let i = 0; i < this.products.length; i++) {
        for (let j = 0; j < usersStars.length; j++) {
            if (this.products[i].userEmail === usersStars[j].userEmail) {
                this.products[i].starsUserRecieved = usersStars[j].starsUserRecieved;
            }
        }
    }
    response.data = this.products;
    console.log("sending products to gateway", socketId)
   return io.sockets.emit('gottenProducts', response);  
}

ProductsController.prototype.getProductsResponse = async function(io) {
    const self = this;
    const productsAndUsersManager = new setUsersAndProductsData();
    self.productClient.on("gottenProducts", function(response) {
        const { socketId, data } = response;
        console.log("socketId", socketId)
        productsAndUsersManager.setProducts(data)
        if(productsAndUsersManager.userAndProductsDataSet()) {
            console.log("user and products data set (products) -------productsController------")
            productsAndUsersManager.setStarsAndSendProductsToGateway(socketId, io);
        }
    });

    self.userClient.on("gottenAllUsers", function(response) {
        const { socketId, data } = response;
        console.log("socketId users", socketId)
        productsAndUsersManager.setUsers(data)
        if(productsAndUsersManager.userAndProductsDataSet()) {
            console.log("user and products set (user) user-------productsController-------")
            productsAndUsersManager.setStarsAndSendProductsToGateway(socketId, io);
        }
    }); 
}
module.exports = ProductsController;