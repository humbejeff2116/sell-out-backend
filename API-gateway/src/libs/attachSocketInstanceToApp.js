
function attachSocketInstanceToApp(app, io, socket) {
    
    app.set("socketInstance", { io,socket })

}
module.exports.attachSocketInstanceToApp = attachSocketInstanceToApp;