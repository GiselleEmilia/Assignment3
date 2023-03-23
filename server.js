/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')

    
    .get(authJwtController.isAuthenticated, function(req,res)  {

        Movie.find({}, (err, movies)=>
        {
            if(err){

                return res.status(500).json({success:false, message:err});
            }else
            {
                const moviesArray = Object.values(movies);
                res.status(200).json({success :true, message:"Successfully retrieved",  moviesArray});
            }
        })     


    })

    
    .post(authJwtController.isAuthenticated, function(req,res) {

        const { title, releaseDate, genre, actors } = req.body;

        if(!title || !releaseDate || !genre || !actors || actors.length < 3 ){

            return res.status(400).json({success: false, message: 'Please Include all information for the movie collection'})

        }

        const newMovie= new Movie({ title, releaseDate, genre, actors});

        newMovie.save(function(err,movie) {

            if(err){

                return res.status(500).json({message: err});
            }
            res.status(200).json({message: 'movie created', movie});
        });

        })


    .delete(authJwtController.isAuthenticated, (req, res) => {

            const title = req.body.title;
        
            if (!title) {
                return res.status(400).json({success: false, message: "Missing title parameter"});
            }
        
            Movie.deleteOne({title}, (err, result) => {
                if (err) {
                    return res.status(500).json({success: false, message: "Error deleting movie"});
                }
        
                if (result.deletedCount === 0) {
                    return res.status(404).json({success: false, message: "No movie found to delete"});
                }
        
                return res.status(200).json({success: true, message: "Movie deleted"});
            });
        
        })
       




    .put(authJwtController.isAuthenticated, (req, res) => {

        const{title, releaseDate, genre, actors }= req.body;

        if(!title || !releaseDate || !genre || !actors || actors.length < 3 ){

            return res.status(400).json({success: false, message:'Invalid request: missing required fields'});

        }else
        {
            Movie.findOneAndUpdate({title: req.body.title}, { title, releaseDate, genre, actors }, { new: true }, function(err, movie){

                if(err)
                {

                    return res.status(500).json({success: false, message:"Unable to update title passed in."});

                }else if(!movie){

                    return res.status(404).json({message:"movie not found"});


                }
                else
                {
                    res.status(200).json({message:"Movie updated",movie});
                }

            });
        }


    })

    .all(function(req,res){

        res.status(404).json('Does not support the HTTP method');
    });


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


