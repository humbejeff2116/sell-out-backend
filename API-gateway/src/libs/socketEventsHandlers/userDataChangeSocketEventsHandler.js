
function userDataChangeSocketEventsHandler(io, socket, socketOptions, UserDataChangeController) {

    const userDataChangeController = new UserDataChangeController();

    userDataChangeController.mountSocket(socketOptions);

    socket.on('userDataChange', function(data) {

        console.log("user data change triggered")

        userDataChangeController.userDataChangeResponse(io, data);

    });
       
}

module.exports.userDataChangeSocketEventsHandler = userDataChangeSocketEventsHandler;