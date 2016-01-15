
// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Models
var fault = require('../models/fault');

// Schema
var faultSchema = new Schema({
	_id: {
		type: String,
		required: true
	},
	fault: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true
	},
	ref_no: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	status: {
		type: String
	}
});

faultSchema.pre('save', function (next) {
	var fault = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(fault.password, salt, function (err, hash) {
				if(err) {
					return next(err);
				}
				fault.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});

faultSchema.methods.comparePassword = function (passw, cb) {
	bcrypt.compare(passw, this.password, function (err, isMatch) {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

// Return Model
module.exports = mongoose.model('fault', faultSchema);