var JwtStrategy = require('passport-jwt').Strategy;

var homeOwner = require('../app/models/homeOwner'); // load up the homeOwner model
var config = require('../config/database'); 		// get db config file

module.exports = function(passport) {
	var opts = {};
	opts.secretOrKey = config.secret;
	passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
		homeOwner.findOne({id: jwt_payload.id}, function(err, homeowner) {
			if (err) {
				return done(err, false);
			}
			if (homeowner) {
				done(null, homeowner);
			} else {
				done(null, false);
			}
		});
	}));
};