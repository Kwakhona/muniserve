
// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Models
var homeOwner = require('../models/homeOwner');

// Schema
var homeOwnerSchema = new Schema({
	Title: {
		type: String,
		required: true
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	phone: {
		type: String
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
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

homeOwnerSchema.pre('save', function (next) {
	var homeOwner = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(homeOwner.password, salt, function (err, hash) {
				if(err) {
					return next(err);
				}
				homeOwner.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});

homeOwnerSchema.methods.comparePassword = function (passw, cb) {
	bcrypt.compare(passw, this.password, function (err, isMatch) {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

// Return Model
module.exports = mongoose.model('homeOwner', homeOwnerSchema);