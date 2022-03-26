
function userSocketEventsHandler(io, socket, socketOptions, UserController) {
    
    const userController = new UserController();

    userController.mountSocket(socketOptions);

    socket.on('signUp', function(data) {

        const signupData = {
            user: data,
            socketId: socket.id
        }

        return userController.signupUser(io, signupData);

    });


    socket.on('login', function(data) {

        const loginData = {
            user: data,
            socketId: socket.id
        }

        userController.loginUser(io, loginData);

    });

    socket.on('getUserById', function(data) {

        const userData = {
            userId: data,
            socketId: socket.id
        }

        userController.getUserById(io, userData);

    });

    // star seller
    socket.on('starSeller', function(data) {

        const socketId = socket.id;

        data.socketId = socketId;

        userController.starUser(io, data);

    });

    // get seller stars
    socket.on('getInitialStarData', function(data) {

        const socketId = socket.id;

        const productData = { socketId, product:data };

        userController.getUserStars(io, productData);

    });

    // get notifications
    socket.on('getNotifications', function(data) {

        const  user = data;

        const socketId = socket.id;

        const notificationData = {socketId, user};
        
        userController.getNotifications(io, notificationData);

    });

    // seen notifications
    socket.on('seenNotifications', function(data) {

        const  user = data;

        const socketId = socket.id;

        const notificationData = {socketId, user};

        userController.seenNotifications(io, notificationData);

    });

    socket.on('getUserPreviousSearches', function(data) {

        const socketId = socket.id;

        data.socketId = socketId;

        userController.getUserPreviousSearches(io, socket, data);

    });

    socket.on('removeUserSearch', function(data) {

        const socketId = socket.id;

        data.socketId = socketId;

        userController.removeUserSearch(io, socket, data);

    });

}

module.exports.userSocketEventsHandler = userSocketEventsHandler;