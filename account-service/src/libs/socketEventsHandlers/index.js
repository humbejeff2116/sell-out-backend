
const { userSocketEventsHandler } = require('./userSocketEventsHandler');
const { productSocketEventsHandler } = require('./productSocketEventHandler');
const { productReviewSocketEventsHandler } = require('./productCommentSocketEventsHandler');
const { productOrderSocketEventsHandler } = require('./productOrderSocketEventHandler');


module.exports = {
    userSocketEventsHandler,
    productSocketEventsHandler,
    productReviewSocketEventsHandler,
    productOrderSocketEventsHandler
}
