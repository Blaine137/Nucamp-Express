const express = require('express');
const bodyParser = require('body-parser');
const favoriteRouter = express.Router();
const cors = require('./cors');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.find( { user: req.user._id } )
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite)
    }).catch(err => console.log(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {

        if(favorite){
            req.body.forEach(fav => {
                if(!favorite.campsites.includes(fav._id)){
                    favorite.campsites.push(fav._id);
                }
            })
            favorite.save()
            .then(res => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                console.log('favorite created: ', res);
                res.json(res);
            });
        }else{
            Favorite.create({user: req.user._id, campsites: req.body});
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                console.log('favorite created: ', favorite);
                res.json(favorite);
            })
        }
        
    }).catch(err => console.log(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id })
    .then(favorite => {
        res.statusCode = 200;
        if(favorite){
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }else{
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.')
        }
    })
});



favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET request not supported on /favorites/:campsiteId')
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {

        if(favorite){
        
                if(!favorite.campsites.includes(req.params.campsiteId)){
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                    .then(res => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        console.log('favorite created: ', res);
                        res.json(res);
                    })
                }
        
        }else{
            Favorite.create({user: req.user._id, campsites: req.params.campsiteId})
            .then(res => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                console.log('favorite created: ', res);
                res.json(res);
            })
        }
        
    }).catch(err => console.log(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOne(req.params.campsiteId)
    .then(fav => {
            if(fav) {
                let index = fav.campsites.indexOf(req.params.campsiteId)
                fav.campsites.splice(index);
                fav.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.send("No favorite to delete");
            }
        })
});


module.exports = favoriteRouter;