/**
 * EDISS@./config/dbConnectionWrite.js
 * @author egupta
 * @description mysql connection details 
 */

module.exports = function (mysql) {
	var connection = mysql.createPool({
		connectionLimit : 200,
		host: 'db-write-915308693.us-east-1.elb.amazonaws.com',
		user:'egupta',
		password: 'abcd1234',
		database: 'EDISS_DB',
		multipleStatements: true
	});
	return connection;	
};
