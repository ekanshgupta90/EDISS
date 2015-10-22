/**
 * EDISS@./config/dbConnection.js
 * @author egupta
 * @description mysql connection details 
 */

module.exports = function (mysql) {
	var connection = mysql.createConnection({
		host: '52.91.115.88',
		user:'egupta',
		password: 'abcd1234',
		database: 'EDISS_DB'
	});
	return connection;	
};
