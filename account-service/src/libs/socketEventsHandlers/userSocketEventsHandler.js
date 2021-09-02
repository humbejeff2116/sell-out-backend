







function userSocketEventsHandler(io, socket, socketOptions, UserController) {
    const userController = new UserController();
    userController.mountSocket(socketOptions)
   socket.on('signUp', function(data) {  
       return userController.signUp(data);
   })
   socket.on('login', function(data) {
       userController.login(data);
   }) 
   socket.on('getUserById', function(data) {
      return userController.getUserById(data);
   })
   socket.on('getAllUsers', function(data) {
    return userController.getAllUsers(io, socket, data);
 })
   socket.on('starUser', function(data) {
       userController.starUser(data)
   })
    // get seller stars
    socket.on('getInitialStarData', function(data) {
       userController.getUserStars(data);
   });
   socket.on('getNotifications', function(data) {
       userController.getNotifications(data);
   });
   socket.on('seenNotifications', function(data) {
       userController.seenNotifications(io, socket, data);
   });
   socket.on('getInterests', function(data) {
       userController.getUserInterests(data);
   });
   socket.on('getConfirmations', function(data) {
       userController.getUserConfirmations(data);
   });
    
}
module.exports.userSocketEventsHandler = userSocketEventsHandler;