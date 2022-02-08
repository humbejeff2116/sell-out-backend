
function removeSocketInstanceFromApp(app, io, socket) {
    
    app.disable("socketInstance")

}
module.exports.removeSocketInstanceFromApp = removeSocketInstanceFromApp;