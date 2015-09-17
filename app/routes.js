/**
 * EDISS@./app/routes.js
 * @author egupta
 * @description All the rest call will be directed to this script.
 */

module.exports = function (app,connection,logger, bodyParser, session) {

	connection.connect();
	
	/**
	 * 
	 */
	app.use(session({secret:'helpme0000', cookie:{maxAge:15*60*1000}}));
	
	/**
	 * Setting body parser for reading the request body
	 */
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	
	app.get('/', function (request, response){
		logger.info("Home page request!");
		var sess = request.session;
		
		if (sess.username) {
			response.redirect('/home');
		}
		response.render('users.html',{message:""});
	});
	
	app.get('/loginPage', function (request, response){
		logger.info("Login page request!");
		
		var sess = request.session;
		
		if (sess.username) {
			response.redirect('/home');
		}
		response.render('login.html');
	});
	
	app.get('/register', function (request, response){
		logger.info("Signup page request!");
		var sess = request.session;
		
		if (sess.username) {
			response.redirect('/home');
		}
		response.render('signup.html',{status:'',message:"Your account has been registered"});
	});
	
	app.get('/getSession', function (request, response){
		logger.info("Session check request!");
		var sess = request.session;
		
		if (sess.username) {
			response.json({username:sess.username, role:sess.role, sessionId:sess.sessionId});
		} else {
			response.json({username:''});
		}
		
	});
	
	app.get('/logout', function (request, response){
		logger.info("Session check request!");
		var sess = request.session;
		
		if (sess.username) {
			sess.username = '';
			sess.role = '';
			sess.sessionId = '';
			response.redirect('/');
		} else {
			response.redirect('/');
		}
		
	});
	
	app.get('/viewUsersPage', function (request, response) {
		var sess = request.session;
		console.log(sess.username + sess.role);
		if(sess.username != null || sess.role !== 'admin') {
			response.redirect('/');
		}
		response.render('viewUser.html');
	});
	
	app.get('/viewUsers', function (request, response) {
		var sess = request.session;
		if(!sess.username && sess.role !== admin) {
			response.redirect('/');
		}
		
		console.log(request.query.search);
		var key = request.query.search;
		var param = request.query.param;
		var query1 = "";
		if (param === 'fName') {
			query1 = "SELECT * FROM User_Details WHERE fName like ?";
		} else {
			query1 = "SELECT * FROM User_Details WHERE lName like ?";
		}
		connection.query(query1,['%'+key+'%'], function (err, rows, fields) {
			if (!err) {
				if (rows.length > 0) {
					var usersArray = new Array();
					for (var i = 0; i < rows.length; i++) {
						var user = {
								fName : rows[i].fName,
								lName : rows[i].lName,
								address : rows[i].address,
								city : rows[i].city,
								state : rows[i].state,
								zip : rows[i].zip,
								email: rows[i].email,
								uName: rows[i].uName
						};
						usersArray.push(user);
					}
					response.json({userlist:usersArray});
				} else {
					response.json({userlist:[]});
				}
			}
		});
	});
	
	app.get('/profilePage', function (request, response){
		logger.info("Session check request!");
		var sess = request.session;
		
		if (sess.username) {
			response.render('profile.html');
		} else {
			response.redirect('/');
		}
		
	});
	
	app.get('/profile', function (request, response){
		logger.info("Session check request!");
		var sess = request.session;
		console.log(sess.username);
		if (sess.username) {
			connection.query('SELECT * FROM User_Details WHERE uName = ?',[sess.username],function (err,rows,field) {
				if(!err) {
					if (rows.length > 0) {
						var data = {
								fName : rows[0].fName,
								lName : rows[0].lName,
								address : rows[0].address,
								city : rows[0].city,
								state : rows[0].state,
								zip : rows[0].zip,
								email: rows[0].email,
								uName: rows[0].uName
						};
						response.json(data);
					} else {
						response.redirect('error.html');
					}
				} else {
					response.redirect('/');
				}
			});
		} else {
			response.redirect('/');
		}
		
	});
	
	app.get('/home', function (request, response){
		logger.info("Home page request!");
		response.render('users.html',{'username':'egupta'});
	});
	
	app.post('/registerUser', function (request, response) {
		logger.info("New user!");
		var sess = request.session;
		
		if (sess.username) {
			response.redirect('/home');
		}
		var success = true;
		connection.query("INSERT INTO User_Details (fName,lName,address,city,state,zip,email,uName) values (?,?,?,?,?,?,?,?)",
				[request.body.fName, request.body.lName, request.body.address, request.body.city, request.body.state, request.body.zip, 
				request.body.email, request.body.uName],function (error, rows, fields) {
			if (!error) {
				connection.query("INSERT INTO Users (uName,password,role) values (?,?,?)",[request.body.uName, request.body.pWord,'user'], function (err1,rows1,field1) {
					if (!err1) {
						response.json({'status' : 's', 'message' : 'Your account has been registered'});
					} else {
						response.json({'status' : 'f', 'message' : 'There was a problem with your registration'});
					}
				});
			} else {
				logger.error(error);
				success = false;
			}
		});
	});
	
	app.post('/updateProfile', function (request, response) {
		logger.info("update user!");
		var sess = request.session;
		
		if (!sess.username) {
			response.redirect('/');
		}
		var success = true;
		var query1 = '',mess = [];
		if (request.body.pWord !== null || request.body.pWord !== '') {
			query1 = 'Update Users set password = ? where uName = ?';
			mess.push(request.body.pWord);
			mess.push(request.body.uName);
			
		} else {
			query1 = 'select * from Users where uName = ?';
			mess.push(request.body.uName);
		}
		if (request.body.fName === null) {
			fName = '';
		} else {
			fName = request.body.fName;
		} 
		if (request.body.lName === null) {
			lName = '';
		} else {
			lName = request.body.lName;
		}
		if (request.body.address === null) {
			address = '';
		} else {
			address = request.body.address;
		}
		if (request.body.city === null) {
			city = '';
		} else {
			city = request.body.city;
		}
		if (request.body.zip === null) {
			zip = '';
		} else {
			zip = request.body.zip;
		}
		if (request.body.state === null) {
			state = '';
		} else {
			state = request.body.state;
		}
		if (request.body.email === null) {
			email = '';
		} else {
			email = request.body.email;
		}
		connection.query(query1,mess,function (error, rows, fields) {
			
			if (!error) {
				connection.query("Update User_Details set fName = ?,lName = ?,address = ?,city = ?,state = ?,zip = ?,email = ? where uName = ?",
						[fName, lName, address, city, state, zip, 
						email, request.body.uName], function (err1,rows1,field1) {
					if (!err1) {
						console.log('update user quesry 1');
						response.json({'status' : 's', 'message' : 'Your account has been updated'});
					} else {
						console.log(err1);
						response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
					}
				});
			} else {
				logger.error(error);
				success = false;
			}
		});
	});

	app.post('/login', function (request, response) {
		
		var sess = request.session;
		logger.info("Login Request");
		
		logger.debug(request.body.username + request.body.password);
		
		logger.debug ('going to db login');
		
		connection.query("SELECT * FROM Users WHERE uName = ? AND password = ?",[request.body.username,request.body.password], function (error, rows, fields) {
			
			if (rows.length > 0) {
				logger.debug('User found in db!');
				sess.username = request.body.username;
				var d = new Date();
				var time = d.getTime();
				var sessId = request.body.username + time;
				sess.sessionId = sessId;
				if (rows[0].role === 'admin') {
					sess.role = 'admin';
					response.json({status:'s',username:request.body.username,err_message:"",sessionID:sess.sessionId,menu:['search','update_product','view_user']});
				} else {
					sess.role = 'user';
					response.json({status:'s',username:request.body.username,err_message:"",sessionID:sess.sessionId,menu:['search']});
				}
			} else {
				response.json({status:'f',username:'',err_message:"Username and password combination is incorrect",sessionId:"",menu:[]});
			}
		});
				
	});
	
	app.get('/getProducts', function (request, response) {
		console.log(request.query.search +request.query.param);
		var productId = null;
		if (request.query.productId) {
			 productId = request.query.productId;
			 console.log(productId);
		}
		var keyword = null;
		if (request.query.keyword) {
			 keyword = request.query.keyword;
			 console.log(keyword);
		}
		var category = null;
		if (request.query.category) {
			 category = request.query.category;
			 console.log(category);
		}
		var query1 = "";
		var par = [];
		if (category) {
			console.log(category);
			query1 = "SELECT * FROM category_master WHERE category_name = ?";
			par.push(category);
			connection.query(query1, par, function (err, rows, fields) {
				if (!err) {
					if (rows.length > 0) {
						console.log(rows);
						var cat_id = rows[0].category_id;
						console.log(cat_id);
						if (keyword) {
							console.log('in keyword search');
							query1 = "SELECT * FROM product WHERE title like ? AND category_key like ?";
							par = new Array();
							par.push('%'+keyword+'%');
							par.push('%'+cat_id+'%');
							connection.query(query1,par,function(err,rows,fields){
								if(!err) {
									if (rows.length > 0) {
										var usersArray = new Array();
										for (var i = 0; i < rows.length; i++) {
											var product = {
													id : rows[i].id,
													title : rows[i].title,
													asin : rows[i].asin,
													groups : rows[i].groups,
													parent : rows[i].parent_id
											};
											usersArray.push(product);
										}
										response.json({productlist:usersArray});
									}
								} else {
									logger.error(err);
									response.json({productlist:[]});
								}
							});
						} else {
							console.log(cat_id);
							query1 = "SELECT * FROM product WHERE category_key like ?";
							par = new Array();
							par.push('%'+cat_id+'%');
							connection.query(query1,par,function(err,rows,fields){
								if(!err) {
									console.log(cat_id);
									if (rows.length > 0) {
										var usersArray = new Array();
										for (var i = 0; i < rows.length; i++) {
											var product = {
													id : rows[i].id,
													title : rows[i].title,
													asin : rows[i].asin,
													groups : rows[i].groups,
													parent : rows[i].parent_id
											};
											usersArray.push(product);
										}
										response.json({productlist:usersArray});
									} else {
										response.json({productlist:[]});
									}
								} else {
									logger.error(err);
									response.json({productlist:[]});
								}
							});
						}
					} else {
						response.json({productlist:[]});
					}
				} else {
					logger.error (err);
					response.json({productlist:[]});
				}
			});
		} else {
			if (keyword) {
				query1 = "SELECT * FROM product WHERE title like ?";
				par.push('%'+keyword+'%');
			} else if (productId){
				query1 = "SELECT * FROM product WHERE id = ?";
				par.push (key);
			} 
			connection.query(query1,par, function (err, rows, fields) {
				if (!err) {
					if (rows.length > 0) {
						var usersArray = new Array();
						for (var i = 0; i < rows.length; i++) {
							var product = {
									id : rows[i].id,
									title : rows[i].title,
									asin : rows[i].asin,
									groups : rows[i].groups,
									parent : rows[i].parent_id
							};
							usersArray.push(product);
						}
						response.json({productlist:usersArray});
					} else {
						response.json({productlist:[]});
					}
				}
			});
		}
	});
	
app.get('/modifyProductPage', function (request, response) {
	var sess = request.session;
	if(!sess.username || sess.role !== 'admin') {
		response.redirect('/');
	}
	response.render('modifyProductPage.html');
	
	});
	
	app.post('/modifyProduct', function (request, response) {
		var sess = request.session;
		if(!sess.username || sess.role !== 'admin') {
			response.redirect('/');
		}
		connection.query("Update product set title = ? where id = ?",[request.body.title,request.body.id], function(err,rows,field){
			if (!err) {
				response.json({'status' : 's', 'message' : 'The product has been updated'});
			} else {
				console.log(err);
				response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
			}
		});
	});
	
	app.post('/answer', function (request, response){
		
		logger.info("Answer Page Request");
		
		logger.debug(request.body.username + "," + request.body.question1 + "," + request.body.question2 + "," + request.body.question3);
		
		var intq1 = parseInt(request.body.question1);
		var intq2 = parseInt(request.body.question2);
		var intq3 = parseInt(request.body.question3);
		
		var data = {
			question1 : intq1,
			question2 : intq2,
			question3 : intq3
		};
		
		if (intq1 === 0 || intq2 === 0 || intq3 === 0) {
			response.render('welcome.ejs',{username:request.body.username, question1:0, question2:0, question3:0, status: 'f', message:"'0' is not an excepted value!"});
		}
		
		connection.query("UPDATE Users SET ? WHERE email = ?",[data, request.body.username], function (error, rows, fields) {
			if (!error) {
					response.render('welcome.ejs',{username:request.body.username, question1:intq1, question2:intq2, question3:intq3, status: 's', message:"Successfully added!"});
			} else {
					console.log(error);
					response.render('welcome.ejs',{message:"Something went wrong!",username:request.body.username, question1:0, status: 'f'});
			}
		}); 
		
		
	});

};
