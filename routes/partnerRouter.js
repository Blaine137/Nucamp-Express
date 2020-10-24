const express = require('express');
const bodyParser = require('body-parser');
const Partner = require('../models/partner');

const partnerRouter = express.Router();

partnerRouter.use(bodyParser.json());

partnerRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})
.get((req, res) => {
    Partner.find()
    .then(partner => {
        res.statusCode = 200;
        res.json(partner)
    }).catch(err => console.log(err))
})
.post((req, res) => {
    Partner.create(req.body)
    .then(partner => {
        console.log('partner created: ', partner);
        res.statusCode = 200;
        res.json(partner);
    }).catch(err => console.log(err))
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /partners');
})
.delete((req, res) => {
    Partner.deleteMany()
    .then(partner => {
        res.statusCode = 200;
        res.json(partner);
    })
});

partnerRouter.route('/:partnerId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})
.get((req, res) => {
    Partner.findById(req.params.partnerId)
    .then(partner => {
        res.statusCode = 200;
        res.json(partner);
    }).catch(err => console.log(err))
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.partnerId}`);
})
.put((req, res) => {
    Partner.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body
    }, { new: true })
    .then(partner => {
        res.statusCode = 200;
        res.json(partner);
    })
    .catch(err => console.log(err));
})
.delete((req, res) => {
    Partner.findByIdAndDelete(req.params.partnerId)
    .then(partner => {
        res.statusCode = 200;
        res.json(partner)
    }).catch(err => console.log(err))
});

module.exports = partnerRouter;