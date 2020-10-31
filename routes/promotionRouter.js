const express = require('express');
const bodyParser = require('body-parser');
const Promotion = require('../models/promotion');
const authenticate = require('../authenticate');
const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})
.get((req, res) => {
    Promotion.find()
    .then(promotion => {
        res.statusCode = 200;
        res.json(promotion)
    }).catch(err => console.log(err))
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotion.create(req.body)
    .then(promotion => {
        console.log('promotion created: ', promotion);
        res.statusCode = 200;
        res.json(promotion);
    }).catch(err => console.log(err))
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotion');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotion.deleteMany()
    .then(promotion => {
        res.statusCode = 200;
        res.json(promotion);
    })
});

promotionRouter.route('/:promotionId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})
.get((req, res) => {
    Promotion.findById(req.params.promotionId)
    .then(partner => {
        res.statusCode = 200;
        res.json(partner);
    }).catch(err => console.log(err))
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.promotionId}`);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotion.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body
    }, { new: true })
    .then(promotion => {
        res.statusCode = 200;
        res.json(promotion);
    })
    .catch(err => console.log(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotion.findByIdAndDelete(req.params.promotionId)
    .then(promotion => {
        res.statusCode = 200;
        res.json(promotion)
    }).catch(err => console.log(err))
});

module.exports = promotionRouter;