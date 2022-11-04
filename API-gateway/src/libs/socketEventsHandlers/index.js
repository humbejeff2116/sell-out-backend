
const { userSocketEventsHandler } = require('./userSocketEventsHandler');
const { productSocketEventsHandler } = require('./productSocketEventHandler');
const { productReviewSocketEventsHandler } = require('./productCommentSocketEventsHandler')
const { orderSocketEventsHandler } = require('./orderSocketEventHandler');
const { userDataChangeSocketEventsHandler } = require('./userDataChangeSocketEventsHandler');
const { feesSocketEventsHandler } = require('./feesSocketEventsHandler');


module.exports = {
    userSocketEventsHandler,
    productSocketEventsHandler,
    productReviewSocketEventsHandler,
    orderSocketEventsHandler,
    userDataChangeSocketEventsHandler,
    feesSocketEventsHandler 
}
