/**
 * EDISS@./config/dbConnection.js
 * @author egupta
 * @description mysql connection details 
 */

module.exports = function (neo4j) {
	var host = 'localhost';
	var port = 7474;
	var connection = new neo4j('http://' + host + ':' + port);
	return connection;	
};
