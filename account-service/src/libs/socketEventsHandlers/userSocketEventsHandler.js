
function userSocketEventsHandler(io, socket, socketOptions, UserController) {
    const userController = new UserController();
    userController.mountSocket(socketOptions);

    socket.on('getUser', function (data, callback) {
        userController.getUser(io, socket, data, callback);
    })

    socket.on('getUserById', function (data, callback) {
        userController.getUserById(io, socket, data, callback);
    })

    socket.on('getReviewUser', function (data, callback) {
        userController.getReviewUser(io, socket, data, callback);
    })

    socket.on('starUser', function (data, callback) {
        userController.starUser(io, socket, data, callback);
    })
    // get seller stars
    socket.on('getInitialStarData', function (data) {
       userController.getUserStars(data);
    });

    socket.on('getNotifications', function (data) {
       userController.getNotifications(data);
    });

    socket.on('seenNotifications', function (data) {
       userController.seenNotifications(io, socket, data);
    });

    socket.on('getInterests', function (data) {
        userController.getUserInterests(data);
    });

    socket.on('getConfirmations', function (data) {
        userController.getUserConfirmations(data);
    });

    socket.on('getUserPreviousSearches', function (data, callback) {
        userController.getUserPreviousSearches(io, socket,data, callback);
    });

    socket.on('updateUserSearchData', function (data) {
        userController.updateUserSearchData(io, socket,data);
    });

    socket.on('removeUserSearch', function (data) {
        userController.removeUserSearch(io, socket,data);
    });
}

module.exports.userSocketEventsHandler = userSocketEventsHandler;