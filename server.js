/**
 * EDISS@./server.js
 * @author egupta
 * @description File to run the primary server.
 */


/**
 * START - Loading dependencies for the application
 */

/**
 * PATH - for reading system path
 */
var path = require('path');

/**
 * EXPRESS - framework for using node
 */
var express = require('express');

/**
 * WINSTON - Logger for application
 */
var logger = require('winston');

/**
 * MYSQL - Mysql connection driver for node
 */
var mysql = require('mysql');

/**
 * BODY-PARSER - to parse JSON return body
 */
var bodyParser = require('body-parser');

/**
 * CLIENT-SESSIONS - session management on the client side
 */
var session = require("client-sessions");

/**
 * MEMCACHED - Cache for storing data
 */
//var memcached = require('memcached');

/**
 * END - Loading dependencies for the application
 */

/**
 * START - Initialization of dependencies for the application
 */

/**
 * APP - Loading application using express
 */
var app= express();


/**
 * Running port for the application 
 */
var port = 8081;

/**
 * Loading mysql db connection configurations
 * @param mysql
 */
var connection = require('./config/dbConnection')(mysql);

var writeconn = require('./config/dbConnectionWrite')(mysql);

//var cache = new memcached('ec2-52-90-171-88.compute-1.amazonaws.com:8088');

/**
 * Loading the logger configurations
 * @param logger
 */
require('./config/logConnection')(logger);


//Serve static files
//app.set('view options', {layout:false});	

//TODO
/**
 * Adding not checked yet
 */
app.engine('html', require('ejs').renderFile);

/**
 * Setting public directory
 */
app.set('views', __dirname + '/public');
//app.use(express.static(path.join(__dirname,'public')));
/** con
 * Setting the web contain viewer to EJS
 */
//app.set('view engine', 'ejs');

/**
 * END - Initialization of dependencies for the application
 */

/**
 * Setting Routes for all the rest request to the page
 * @param app, connection, logger, bodyparser, session
 */
require('./app/routes')(app,connection,logger,bodyParser,session,writeconn);

/**
 * Runs the server on specified port
 * @param port
 */
app.listen(port);
logger.info('Server up and running on port ' + port + '!' );
