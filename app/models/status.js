
// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// Models
var status = require('../models/status');

// Schema
var statusSchema = new Schema({
	_id: {
		type: String,
		required: true
	},
	status: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	}
});

statusSchema.pre('save', function (next) {
	var status = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(status.password, salt, function (err, hash) {
				if(err) {
					return next(err);
				}
				status.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});

statusSchema.methods.comparePassword = function (passw, cb) {
	bcrypt.compare(passw, this.password, function (err, isMatch) {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

// Return Model
module.exports = mongoose.model('status', statusSchema);