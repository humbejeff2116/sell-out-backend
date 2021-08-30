
function attachSocketInstanceToApp(app, io, socket) {
    function HTTPSocketManger() {
        this.io;
        this.socket;
    }
    HTTPSocketManger.prototype.setSocketDetails = function(io, socket) {
        this.io = io;
        this.socket = socket;
    }
    const HTTPSocketInstance = new HTTPSocketManger();
    HTTPSocketInstance.setSocketDetails(io, socket);
    app.set("socketInstance", HTTPSocketInstance)
}
exports.attachSocketInstanceToApp = attachSocketInstanceToApp;