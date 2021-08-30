







function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    
    const productAndServiceController = new ProductController();
    productAndServiceController.mountSocket(socketOptions);

    socket.on('createProduct', function(data) {
        console.log("creating product");
        console.log(data);
        const createProductData = data;
        createProductData.socketId = socket.id; 
        productAndServiceController.createProduct(createProductData);
    });
    productAndServiceController.createProductResponse(io);

    socket.on('getProducts', function() {
        const socketId = socket.id;
        productAndServiceController.getProducts(socketId);
    }); 
    productAndServiceController.getProductsResponse(io);

    socket.on('createService', function(data) {
        console.log('creating service', data);
        const createServiceData = data;
        createServiceData.socketId = socket.id; 
        return productAndServiceController.createService(createServiceData);
    });
    productAndServiceController.createServiceResponse(io)

    socket.on('getServices', function() {
        const socketId = socket.id;
        productAndServiceController.getServices(socketId);
    });
    productAndServiceController.getServicesResponse(io);

    // get product or service
    socket.on('getProductOrService', function(data) {
        const { productOrService, user } = data;
        const socketId = socket.id;
        const getProductOrServiceData = {
            user: user,
            productOrService: productOrService,
            socketId :socketId
        }
         productAndServiceController.getProductOrService(getProductOrServiceData);   
    });
    productAndServiceController.getProductOrServiceResponse(io);
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
        productAndServiceController.showInterest(showInterestData);   
    });
    productAndServiceController.showInterestResponse(io);
}
module.exports.productSocketEventsHandler = productSocketEventsHandler;