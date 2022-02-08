






function userDataChangeSocketEventsHandler(io, socket, socketOptions, UserDataChangeController) {

    const userDataChangeController = new UserDataChangeController();
    userDataChangeController.mountSocket(socketOptions);
    userDataChangeController.userDataChangeResponse(io);
    
}

module.exports.userDataChangeSocketEventsHandler = userDataChangeSocketEventsHandler;