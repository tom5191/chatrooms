var express = require('express');

var v1Router = express.Router();

require('./routes/v1')(v1Router);

module.exports = function (app, passport) {

	// API router
	app.use('/api', v1Router);

};