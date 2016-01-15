// Dependencies
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport 	  = require('passport');
var config      = require('./config/database'); // get db config file

var HomeOwner	= require('./app/models/homeOwner'); // get homeOwner mongoose Model
var Councilor = require('./app/models/councilor'); // get councilor mongoose Model
var Fault     = require('./app/models/fault'); // get fault mongoose Model
var Status    = require('./app/models/status'); // get status mongoose Model


var port        = process.env.PORT || 3000;
var jwt         = require('jwt-simple');

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));
// Use the passport package in our application
app.use(passport.initialize());
// demo Route (GET http://localhost:3000)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api/muniserve');
});
// connect to database
mongoose.connect(config.database);
// pass passport for configuration
require('./config/passport')(passport);
// bundle our routes
var apiRoutes = express.Router();

// Registration of a new Home Owner account (POST http://localhost:3000/api/muniserve/homeowner/signup)
apiRoutes.post('/homeowner/signup', function(req, res) {
  if(!req.body.Title || !req.body.firstName || !req.body.lastName || !req.body.address || !req.body.email  || !req.body.phone || !req.body.username || !req.body.password || !req.body.municipality || !req.body.ward) {
    res.json({success: false, msg: 'Please make sure you enter all the require fields.'});
  } else {
      HomeOwner.findOne({ username: req.body.username }, function(err, homeowner) {
        if(err) throw err;
        if(!homeowner) {
          Councilor.findOne({ username: req.body.username }, function(err, councilor) {
            if (err) throw err;
            if(!councilor) {
              var newHomeOwner = new HomeOwner({
                Title: req.body.Title,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                email: req.body.email,
                phone: req.body.phone,
                username: req.body.username,
                password: req.body.password,
                municipality: req.body.municipality,
                ward: req.body.ward
              });
              // save the Home Owner
              newHomeOwner.save(function(err) {
                if(err) {
                  return res.json({success: false, msg: 'Sorry ' + newHomeOwner.firstName +' '+ newHomeOwner.lastName +' your registration attempt has failed. Please try again.'});
                } else {
                    // if user successfully created. A token is also created.
                    var token = jwt.encode(newHomeOwner, config.secret);
                    // return the information including token as JSON
                    return res.json({ success: true, token: 'JWT ' + token, msg: 'Your Home Owner Account has been successfully Created.' });
                }
              });
            } else {
                return res.json({success: false, msg: 'Sorry. Username belongs to a Councilor. Please submit a new Username.'});
            }
          });
        } else {
            return res.json({success: false, msg: 'Sorry. Username belongs to a Home Owner. Please submit a new Username.'});
        }
      });
  }
});
// Registration of a new Councilor account (POST http://localhost:3000/api/muniserve/councilor/signup)
apiRoutes.post('/councilor/signup', function(req, res) {
  if(!req.body.firstName || !req.body.lastName || !req.body.email  || !req.body.phone || !req.body.username || !req.body.password || !req.body.municipality || !req.body.ward) {
    res.json({success: false, msg: 'Please make sure you enter all the require fields.'});
  } else {
      HomeOwner.findOne({ username: req.body.username }, function(err, homeowner) {
        if(err) throw err;
        if(!homeowner) {
          Councilor.findOne({ username: req.body.username }, function(err, councilor) {
            if (err) throw err;
            if(!councilor) {
              var newCouncilor = new Councilor({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                username: req.body.username,
                password: req.body.password,
                municipality: req.body.municipality,
                ward: req.body.ward
              });
              // save the Councilor
              newCouncilor.save(function(err) {
                if(err) {
                  return res.json({success: false, msg: 'Sorry ' + newCouncilor.firstName +' '+ newCouncilor.lastName +' your registration attempt has failed. Please try again.'});
                } else {
                    // if user successfully created. A token is also created.
                    var token = jwt.encode(newCouncilor, config.secret);
                    // return the information including token as JSON
                    return res.json({ success: true, token: 'JWT ' + token, msg: 'Your Councilor Account has been successfully Created.' });
                }
              });
            } else {
                return res.json({success: false, msg: 'Sorry. Username belongs to a Councilor. Please submit a new Username.'});
            }
          });
        } else {
            return res.json({success: false, msg: 'Sorry. Username belongs to a Home Owner. Please submit a new Username.'});
        }
      });
  }
});
// Authentication (POST http://localhost:3000/api/muniserve/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  if (!req.body.username || !req.body.password) {
    return res.json({ success: false, msg: 'Please make sure you enter all the require fields.' });
  } else {
      HomeOwner.findOne({ username: req.body.username }, function(err, homeowner) {
        if (err) throw err; 
        if(!homeowner) {
          Councilor.findOne({ username: req.body.username }, function(err, councilor) {
            if(!councilor) {
              return res.json({ success: false, msg: 'Authentication failed. User does not exist.' })
            } else {
                // check if password matches
                councilor.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                  // if user is found and password is right create a token
                  var token = jwt.encode(councilor, config.secret);
                  // return the information including token as JSON
                  return res.json({success: true , msg: 'User authenticattion successful' , token: 'JWT ' + token});
                } else {
                    return res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                  }
                });
              }
          });
        } else {
            // check if password matches
            homeowner.comparePassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {
              // if user is found and password is right create a token
              var token = jwt.encode(homeowner, config.secret);
              // return the information including token as JSON
              return res.json({success: true , msg: 'User authenticattion successful' , token: 'JWT ' + token});
            } else {
                return res.send({success: false, msg: 'Authentication failed. Wrong password.'});
              }
            });
          }
      });
  }
});

// Get Home Owner Information (POST http://localhost:3000/api/muniserve/homeowner/info
apiRoutes.get('/homeowner/info', passport.authenticate('jwt', { session: false }), function(req, res) {
  var token = getToken(req.headers);
  if(token) {
    var decoded = jwt.decode(token, config.secret);
    HomeOwner.findOne({ username: decoded.username }, function(err, homeowner) {
      if(!homeowner){
        return res.status(403).send({ success: false, msg: 'Authentication has failed. Home Owner information was not found.' });
      } else {
          res.json({
            success: true,
            title: homeowner.Title,
            fname: homeowner.firstName,
            lname: homeowner.lastName,
            address: homeowner.address,
            email: homeowner.email,
            phone: homeowner.phone,
            username: homeowner.username,
            municipality: homeowner.municipality,
            ward: homeowner.ward,
            msg : "Thank you for coming in. We hope you enjoy your stay. Please call again."
          });
      }
    });
  } else {
      return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});
// Get Councilor Information (POST http://localhost:3000/api/muniserve/councilor/info
apiRoutes.get('/councilor/info', passport.authenticate('jwt', { session: false }), function(req, res) {
  var token = getToken(req.headers);
  if(token) {
    var decoded = jwt.decode(token, config.secret);
    Councilor.findOne({ username: decoded.username }, function(err, councilor) {
      if(!councilor){
        return res.status(403).send({ success: false, msg: 'Authentication has failed. Councilor information was not found.' });
      } else {
          res.json({
            success: true,
            fname: councilor.firstName,
            lname: councilor.lastName,
            email: councilor.email,
            phone: councilor.phone,
            username: councilor.username,
            municipality: councilor.municipality,
            ward: councilor.ward,
            msg : "Thank you for coming in. We hope you enjoy your stay. Please call again."
          });
      }
    });
  } else {
      return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

// Create the Status
apiRoutes.post('/councilor/status/create', function(req, res) {
  if(!req.body.status){
    return res.json({ success: false, msg: 'Please make sure you enter all the required.' });
  } else {
      var token = getToken(req.headers);
      if(token) {
        Status.findOne({ _id: req.body._id }, function(err, status) {
          var newStatus = new Status({
            _id: req.body.username + '_' + Date.now() + '_st',
            status: req.body.status,
            date: Date().substring(0, 21),
            username: req.body.username
          });
          // save the status
          newStatus.save(function(err) {
            if(err){
              return res.json({success: false, msg: 'Sorry. Ward Status upload has failed. Please try agin.'});
            } else {
                return res.json({success: true, msg: 'Ward Status Upload was successful.'});
            }
          });
        });
      } else {
          return res.json({success: true, msg: 'Sorry. Ward Status Upload ahs already been created. Please submit a new Ward Status.'});
      }
  }
});
apiRoutes.get('/councilor/status/view',  passport.authenticate('jwt', { session: false }), function(req, res) {
  var token = getToken(req.headers);
  if(token) {
    var decoded = jwt.decode(token, config.secret);
    Status.find({  }, function(err, status) {
      if(!status){
        return res.status(403).send({ success: false, msg: 'Authentication has failed. Ward Status information was not found..'});
      } else {
          res.json({
            success: true,
            statuses: status
          });
      }
    });
  }
});
// Create the Fault
apiRoutes.post('/homeowner/fault/create', function(req, res) {
  if (!req.body.fault || !req.body.username) {
    res.json({ success: false, msg: 'Sorry. Please enter all required fields.' });
  } else {
      var token = getToken(req.headers);
      if(token) {
        Fault.findOne({ _id: req.body._id }, function(err, fault) {
          if (!fault) {
            var newFault = new Fault({
                _id: req.body.username + "_" + Date.now() + "_flt",
                fault: req.body.fault,
                date: Date().substring(0,21),
                ref_no: Date.now(),
                username: req.body.username,
                status: 'Pending'
            });
            // save the fault
            newFault.save(function(err) {
              if(err) {
                return res.json({ success: false, msg: 'Sorry. Fault Logging has failed. Please retry.'});
              } else {
                  return res.json({ success:true, msg: 'Congratulations. Your fault has been logged.' });
              }
            });
          } else {
              return res.json({success: false, msg: 'Sorry. Fault has already been created. Please submit a new Fault.'});
          }
        });
      }
  }
});
apiRoutes.get('/homeowner/fault/view', passport.authenticate('jwt', { session: false }), function(req, res){
  var token = getToken(req.headers);
  if(token) {
    var decoded = jwt.decode(token, config.secret);
    Fault.find({ username: decoded.username }, function(err, fault) {
      if(!fault) {
        return res.status(403).send({ success: false, msg: 'Authentication has failed. Fault information was not found.'});
      } else {
          res.json({
            success: true,
            faults: fault
          });
      }
    });
  }
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
// connect the api routes under /api/*
app.use('/api/muniserve', apiRoutes);
// Start Server
app.listen(port);
console.log('There are dragons: http://localhost:' + port);
