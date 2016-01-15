
// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Models
var councilor = require('../models/councilor');

// Schema
var councilorSchema = new Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	phone: {
		type: String
	},
	municipality: {
		type: String,
		required: true
	},
	ward: {
		type: String,
		required: true
	}
});

councilorSchema.pre('save', function (next) {
	var councilor = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(councilor.password, salt, function (err, hash) {
				if(err) {
					return next(err);
				}
				councilor.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});

councilorSchema.methods.comparePassword = function (passw, cb) {
	bcrypt.compare(passw, this.password, function (err, isMatch) {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

// Return Model
module.exports = mongoose.model('councilor', councilorSchema);