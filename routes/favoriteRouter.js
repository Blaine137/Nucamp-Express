const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get( cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find( { user: req.user._id } )
	.populate('user')
	.populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne( { user: req.user._id } ).then(
		favorite => {
			if(favorite) {
				req.body.forEach(fav => {
					if(!favorite.campsites.includes(fav._id)) {
						favorite.campsite.push(fav._id);
					}
				});	
				favorite.save().then(
					fav => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(fav);
					}
				);

			} else {
				Favorite.create({ user: req.user._id, campsites: req.body })
				.then( favorite => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
        			res.json(favorite);
				});
			}
			console.log('favorite created', favorite);
			res.statusCode = 200;
			res.json(favorite)
		}
	).catch(err => next(err));
} )
.put( cors.corsWithOptions, authenticate.verifyUser,  (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
	Favorite.findOneAndDelete({ user: req.user._id })
	.then(response => {
		if(response) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(response);
		} else {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/plain');
			res.end('You do not have any favorites to delete.');
		}
	})
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
    res.end('Get operation not supported on /favorites/campsiteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne( { user: req.user._id } ).then(
		favorite => {
			if(favorite) {
				if(!favorite.campsites.includes(req.params.campsiteId)) {
					favorite.campsite.push(req.params.campsiteId);
					favorite.save()
					.then(
						fav => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(fav);
						}
					)
					.catch(err => {
						next(err);
					})
				}
			} else {
				Favorite.create({ user: req.user._id, campsites: req.params.campsiteId })
				.then( favorite => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
        			res.json('your favorite has been added', favorite);
				});
			}
		}
	).catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
    res.end('Put operation not supported on /favorites/campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne(req.params.campsiteId)
	.then(
		fav => {
			if(fav) {
				let index = fav.campsites.indexOf(req.params.campsiteId)
				fav.campsites.splice(index);
				fav.save().then(
					fav => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(fav);
					}
				)
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
        		res.json(fav);
			} else {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'text/plain');
        		res.send("No favorite to delete");
			}
		}
	)
});

module.exports = favoriteRouter;