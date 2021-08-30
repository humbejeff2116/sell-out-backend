
const express = require('express')
const router = express.Router();


router.use((req, res)=> {
    console.log("route not found")
    res.status(404).json('route not found')
});

router.use((err, req, res, next) => {
    console.error(err)
    next(err)
})

router.use((err, req, res, next) => {
    res.status(500).json('internal sever error')
})

module.exports = router;