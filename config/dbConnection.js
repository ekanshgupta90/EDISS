/**
 * EDISS@./config/dbConnection.js
 * @author egupta
 * @description mysql connection details 
 */

module.exports = function (mysql) {
	var connection = mysql.createPool({
		connectionLimit : 200,
		host: '52.23.172.111',
		user:'egupta',
		password: 'abcd1234',
		database: 'EDISS_DB',
		multipleStatements: true
	});
	return connection;	
};
