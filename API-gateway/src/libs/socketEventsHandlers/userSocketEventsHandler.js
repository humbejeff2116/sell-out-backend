

function userSocketEventsHandler(io, socket, socketOptions, UserController) {
    
    const userController = new UserController();
    userController.mountSocket(socketOptions);
    socket.on('signUp', function(data) {
        const signupData = {
            user: data,
            socketId: socket.id
        }
        return userController.signupUser(signupData);
    });
    userController.signupUserResponse(io);

    socket.on('login', function(data) {
        console.log("login in");
        const loginData = {
            user: data,
            socketId: socket.id
        }
        userController.loginUser(loginData);
    });
    userController.loginUserResponse(io);

    socket.on('getUserById', function(data) {
        console.log("getting user");
        console.log("responding to", socket.id);
        const userData = {
            userId: data,
            socketId: socket.id
        }
        userController.getUserById(userData);
    });
    userController.getUserByIdResponse(io);
    // star seller
    socket.on('starSeller', function(data) {
        const socketId = socket.id;
        data.socketId = socketId;
        userController.starUser(data);
    });
    userController.starUserResponse(io);
    // get seller stars
    socket.on('getInitialStarData', function(data) {
        const socketId = socket.id;
        const productData = { socketId, product:data };
        console.log("getting user stars");
        userController.getUserStars(productData);
    });
    userController.getUserStarsResponse(io);
    // get notifications
    socket.on('getNotifications', function(data) {
        const  user = data;
        const socketId = socket.id;
        const notificationData = {socketId, user};
        
        userController.getNotifications(notificationData);
    });
    userController.getNotificationsResponse(io);
    // seen notifications
    socket.on('seenNotifications', function(data) {
        const  user = data;
        const socketId = socket.id;
        const notificationData = {socketId, user};
        userController.seenNotifications(notificationData);
    });
    userController.seenNotificationsResponse(io);
    // get user interest
    socket.on('getInterests', function(data) {
        const  user = data;
        const socketId = socket.id;
        const interestData = {socketId, user};
        console.log("getting user interest", user);
        userController.getInterests(interestData);
    });
    userController.getInterestsResponse(io);
    // get confirmations
    socket.on('getConfirmations', function(data) {
        const  user = data;
        const socketId = socket.id;
        const interestData = {socketId, user};
        console.log("getting user confirmations", user);
        userController.getConfirmations(interestData);
    });
    userController.getConfirmationsResponse(io);
}
module.exports.userSocketEventsHandler = userSocketEventsHandler;