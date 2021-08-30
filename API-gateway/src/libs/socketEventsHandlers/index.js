




const {userSocketEventsHandler} = require('./userSocketEventsHandler');
const {productSocketEventsHandler} = require('./productSocketEventHandler');
const {productCommentSocketEventsHandler} = require('./productCommentSocketEventsHandler')
const {orderSocketEventsHandler} = require('./orderSocketEventHandler');


module.exports = {
    userSocketEventsHandler,
    productSocketEventsHandler,
    productCommentSocketEventsHandler,
    orderSocketEventsHandler
}
