







function productSocketEventsHandler(io, socket, socketOptions, ProductController) {
    // create an instance of the product controller class
    const productOrService = new ProductController();
    productOrService.mountSocket(socketOptions);

    socket.on('createProduct', function(data) {  
        productOrService.createProduct(data);
    })
    productOrService.createProductResponse();

    socket.on('getProducts', function(data) {  
        productOrService.getProducts(data);
    });
    productOrService.getProductsResponse();
    // service controller
    socket.on('createService', function(data) {
        console.log('service data',data);
        return productOrService.createService(data);
    })
    productOrService.createServiceResponse();

    socket.on('getServices', function(data) {  
        productOrService.getServices(data);
    });
    productOrService.getServicesResponse();

    socket.on('getProductOrService', function(data) {
        productOrService.getProductOrService(data);   
    });
    productOrService.getProductOrServiceResponse();
    socket.on('showInterest', function(data) {
        productOrService.showInterest(data);   
    });
    productOrService.showInterestResponse();

}
module.exports.productSocketEventsHandler = productSocketEventsHandler;