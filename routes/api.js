
// Dependencies
var express = require('express');
var router = express.Router();

// Models
var homeOwner = require('../models/homeOwner');
var councilor = require('../models/councilor');
var fault = require('../models/fault');
var status = require('../models/status');

// Routes
homeOwner.methods(['get', 'put', 'post', 'delete']);
homeOwner.register(router, '/homeowners');

councilor.methods(['get', 'put', 'post']);
councilor.register(router, '/councilors');

fault.methods(['get', 'put', 'post', 'delete']);
fault.register(router, '/faults');

status.methods(['get', 'put', 'post', 'delete']);
status.register(router, '/statuses');

// Routes router
module.exports = router;