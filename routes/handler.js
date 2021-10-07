const express = require("express")
const router = express.Router()

router.get("/tweets", (req, res) => {
    const str = [{
        "name": "Koki",
        "userId": 1,
        "language": "Japanese"
    }]
    res.end(JSON.stringify(str))
})


module.exports = router
