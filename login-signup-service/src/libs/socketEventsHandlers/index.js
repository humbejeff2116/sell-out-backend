




const {userSocketEventsHandler} = require('./userSocketEventsHandler');
const {productSocketEventsHandler} = require('./productSocketEventHandler');
const {productCommentSocketEventsHandler} = require('./productCommentSocketEventsHandler')
const {productOrderSocketEventsHandler} = require('./productOrderSocketEventHandler');


module.exports = {
    userSocketEventsHandler,
    productSocketEventsHandler,
    productCommentSocketEventsHandler,
    productOrderSocketEventsHandler
}
