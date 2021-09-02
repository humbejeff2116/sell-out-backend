







function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    
    const productontroller = new ProductController();
    productontroller.mountSocket(socketOptions);

    socket.on('createProduct', function(data) {
        console.log("creating product");
        console.log(data);
        const createProductData = data;
        createProductData.socketId = socket.id; 
        productontroller.createProduct(createProductData);
    });
    productontroller.createProductResponse(io);

    socket.on('getProducts', function() {
        const socketId = socket.id;
        productontroller.getProducts(socketId);
    }); 
    productontroller.getProductsResponse(io, socket);

    // show interest
    socket.on('showInterest', function(data) {
        console.log("show interest data", data)
        const { product, user, interested } = data;
        const socketId = socket.id;
        const showInterestData = {
            user: user,
            productOrService: product,
            socketId :socketId,
            interested: interested,
        }
        productontroller.showInterest(showInterestData);   
    });
    productontroller.showInterestResponse(io);
}
module.exports.productSocketEventsHandler = productSocketEventsHandler;