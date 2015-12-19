/**
 * EDISS@./config/dbConnection.js
 * @author egupta
 * @description mysql connection details 
 */

module.exports = function (mysql) {
	var connection = mysql.createPool({
		connectionLimit : 300,
		host: 'db-read-1307833618.us-east-1.elb.amazonaws.com',
		user:'egupta',
		password: 'abcd1234',
		database: 'EDISS_DB',
		multipleStatements: true
	});
	return connection;	
};
