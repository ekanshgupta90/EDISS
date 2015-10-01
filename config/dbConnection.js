/**
 * EDISS@./config/dbConnection.js
 * @author egupta
 * @description mysql connection details 
 */

module.exports = function (mysql) {
	var connection = mysql.createConnection({
		host: 'ediss-db.c47a5hmpj9xh.us-east-1.rds.amazonaws.com',
		user:'',
		password: '',
		database: ''
	});
	return connection;	
};
