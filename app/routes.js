/**
 * EDISS@./app/routes.js
 * @author egupta
 * @description All the rest call will be directed to this script.
 */

module.exports = function (app,connection,logger, bodyParser, session) {

	//connection.connect();
	
	/**
	 * 
	 */
	//app.use(cookieParser);
	//app.use(session({secret:'helpme0000', cookie:{maxAge:15*60*1000}}));

	app.use(session({
		  cookieName: 'mySession', // cookie name dictates the key name added to the request object
		  secret: 'helpme0000', // should be a large unguessable string
		  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
		  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
		}));
	
	/**
	 * Setting body parser for reading the request body
	 */
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	
	app.get('/', function (request, response){
		logger.info("Home page request!");
		var sess = request.mySession;
		
		if (sess.username) {
			response.redirect('/home');
		}
		response.render('users.html',{message:""});
	});
	
	app.get('/loginPage', function (request, response){
		logger.info("Login page request!");
		
		var sess = request.mySession;
		
		if (sess.username) {
			response.redirect('/home');
		}
		response.render('login.html');
	});
	
	app.get('/register', function (request, response){
		logger.info("Signup page request!");
		var sess = request.mySession;
		
		if (sess.username) {
			response.redirect('/home');
		}
		response.render('signup.html',{status:'',message:"Your account has been registered"});
	});
	
	app.get('/getSession', function (request, response){
		logger.info("Session check request!");
		var sess = request.mySession;
		
		if (sess.username) {
			response.json({username:sess.username, role:sess.role, sessionId:sess.sessionId});
		} else {
			response.json({username:''});
		}
		
	});
	
	app.get('/logout', function (request, response){
		logger.info("Session check request!");
		var sess = request.mySession;
		
		if (sess.username) {
			sess.username = '';
			sess.role = '';
			sess.sessionId = '';
			response.cookie('mySession', sess)
			response.redirect('/');
		} else {
			response.redirect('/');
		}
		
	});
	
	app.get('/viewUsersPage', function (request, response) {
		var sess = request.mySession;
		console.log(sess.username + sess.role);
		if(!sess.username || sess.role !== 'admin') {
			response.redirect('/');
		}
		response.render('viewUser.html');
	});
	
	app.get('/viewUsers', function (request, response) {
		var sess = request.mySession;
		if(!sess.username && sess.role !== admin) {
			response.redirect('/');
		}
		
		console.log(request.query.search);
		var query1 = "", key = [];
		if (request.query.fname) {
			query1 = "SELECT * FROM User_Details WHERE fName like ?";
			key.push('%'+request.query.fname+'%');
		} else if (request.query.lname) {
			query1 = "SELECT * FROM User_Details WHERE lName like ?";
			key.push('%'+request.query.lname+'%');
		} else {
			response.json({user_list:[]});
		}
		connection.getConnection(function(err,conn){
			if (err) {
				logger.error (err);
				response.json({user_list:[]});
			}
			conn.query(query1,key, function (err, rows, fields) {
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
						conn.release();
						response.json({user_list:usersArray});
					} else {
						conn.release();
						response.json({user_list:[]});
					}
				}
			});
		});
		
	});
	
	app.get('/profilePage', function (request, response){
		logger.info("Session check request!");
		var sess = request.mySession;
		
		if (sess.username) {
			response.render('profile.html');
		} else {
			response.redirect('/');
		}
		
	});
	
	app.get('/profile', function (request, response){
		logger.info("Session check request!");
		var sess = request.mySession;
		console.log(sess.username);
		if (sess.username) {
			connection.getConnection(function(err,conn){
				if (err) {
					logger.error(err);
					response.json({});
				}
				conn.query('SELECT * FROM User_Details WHERE uName = ?',[sess.username],function (err,rows,field) {
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
							conn.release();
							response.json(data);
						} else {
							conn.release();
							response.redirect('error.html');
						}
					} else {
						conn.release();
						response.redirect('/');
					}
				});
			});
			
		} else {
			response.redirect('/');
		}
		
	});
	
	app.get('/home', function (request, response){
		if(request.mySession) {
			logger.debug(request.mySession);
		}
		logger.info("Home page request!");
		response.render('users.html');
	});
	
	app.post('/registerUser', function (request, response) {
		logger.info("New user!");
		var success = true;
		connection.getConnection(function(err,conn){
			if(err) {
				logger.error(err);
				response.json({'status' : 'f', 'message' : 'There was a problem with your registration'});
			}
			
			conn.query("INSERT INTO User_Details (fName,lName,address,city,state,zip,email,uName) values (?,?,?,?,?,?,?,?)",
					[request.body.fname, request.body.lname, request.body.address, request.body.city, request.body.state, request.body.zip, 
					request.body.email, request.body.username],function (error, rows, fields) {
				if (!error) {
					conn.query("INSERT INTO Users (uName,password,role) values (?,?,?)",[request.body.username, request.body.password,'user'], function (err1,rows1,field1) {
						
						if (!err1) {
							conn.release();
							response.json({'status' : 's', 'message' : 'Your account has been registered'});
						} else {
							conn.release();
							response.json({'status' : 'f', 'message' : 'There was a problem with your registration'});
						}
					});
				} else {
					logger.error(error);
					success = false;
					conn.release();
					response.json({'status' : 'f', 'message' : 'There was a problem with your registration'});
				}
			});
		});
		
		
	});
	
	app.post('/updateInfo', function (request, response) {
		logger.info("update user!");
		var sess = request.mySession;
		
		if (!sess.username) {
			response.redirect('/');
		}
		var success = true;
		var query1 = '',mess = [];
		if (request.body.password) {
			query1 = 'Update Users set password = ? where uName = ?';
			mess.push(request.body.password);
			mess.push(request.body.username);
			
		} else {
			query1 = 'select * from Users where uName = ?';
			mess.push(request.body.username);
		}
		if (request.body.fname === null) {
			fname = '';
		} else {
			fname = request.body.fname;
		} 
		if (request.body.lname === null) {
			lname = '';
		} else {
			lname = request.body.lname;
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
		connection.getConnection(function(err,conn){
			if(err) {
				logger.error(err);
				response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
			}
			connection.query(query1,mess,function (error, rows, fields) {
				
				if (!error) {
					connection.query("Update User_Details set fName = ?,lName = ?,address = ?,city = ?,state = ?,zip = ?,email = ? where uName = ?",
							[fname, lname, address, city, state, zip, 
							email, request.body.username], function (err1,rows1,field1) {
						if (!err1) {
							conn.release();
							response.json({'status' : 's', 'message' : 'Your account has been updated'});
						} else {
							conn.release();
							console.log(err1);
							response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
						}
					});
				} else {
					conn.release();
					logger.error(error);
					success = false;
					response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
					
				}
			});
		});
		
		
	});
	
	app.get('/healthCheck', function(request,response) {
		response.statusCode = 200;
		response.send();
	});

	app.post('/login', function (request, response) {
		
		
		logger.info("Login Request");
		var sess = request.mySession;
		logger.debug(request.body.username + request.body.password);
		
		logger.debug ('going to db login');
		
		connection.getConnection(function(err,conn){
			if(err) {
				logger.error(err);
				response.json({status:'f',username:'',err_message:"Username and password combination is incorrect",sessionId:"",menu:[]});
			}
			
			conn.query("SELECT * FROM Users WHERE uName = ? AND password = ?",[request.body.username,request.body.password], function (error, rows, fields) {
				
				if (rows.length > 0) {
					logger.debug('User found in db!');
					sess.username = request.body.username;
					var d = new Date();
					var time = d.getTime();
					var sessId = request.body.username + time;
					sess.sessionId = sessId;
					if (rows[0].role === 'admin') {
						sess.role = 'admin';
						response.cookie('mySession', sess);
						conn.release();
						response.json({status:'s',username:request.body.username,err_message:"",sessionID:sess.sessionId,menu:['search','update_product','view_user']});
					} else {
						conn.release();
						sess.role = 'user';
						response.cookie('mySession', sess);
						response.json({status:'s',username:request.body.username,err_message:"",sessionID:sess.sessionId,menu:['search']});
					}
				} else {
					conn.release();
					response.json({status:'f',username:'',err_message:"Username and password combination is incorrect",sessionId:"",menu:[]});
				}
			});
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
		connection.getConnection(function(err,conn){
			if (err) {
				logger.error(err);
				response.json({product_list:[]});
			}
			if (category) {
				logger.info(category);
				query1 = "SELECT distinct(id) FROM map WHERE tag like ? limit 100";
				par.push('%',category,'%');
				
				conn.query(query1, par, function (err, rows, fields) {
					if (!err) {
						logger.info(rows);
						if (rows.length > 0) {
							var id_str = '';
							for (var i = 0; i < rows.length; i++) {
								if (i+1 !== rows.length)
									id_str += rows[i].id + ',';
								else
									id_str += rows[i].id;
							}
							logger.info(id_str);
							if (keyword) {
								logger.debug('in keyword search');
								query1 = "SELECT * FROM product WHERE title like ? AND id in (" + id_str + ") limit 100";
								par = new Array();
								par.push('%'+keyword+'%');
								conn.query(query1,par,function(err,rows1,fields){
									if(!err) {
										if (rows1.length > 0) {
											logger.info(rows1);
											var usersArray = new Array();
											for (var i = 0; i < rows1.length; i++) {
												var product = {
														id : rows1[i].id,
														title : rows1[i].title,
														asin : rows1[i].asin,
														groups : rows1[i].group
												};
												usersArray.push(product);
											}
											conn.release();
											response.json({product_list:usersArray});
										}
									} else {
										logger.error(err);
										conn.release();
										response.json({product_list:[]});
									}
								});
							} else {
								
								query1 = "SELECT * FROM product WHERE id in (" + id_str + ") limit 100";
								
								conn.query(query1,function(err,rows1,fields){
									if(!err) {
										if (rows1.length > 0) {
											var usersArray = new Array();
											for (var i = 0; i < rows1.length; i++) {
												var product = {
														id : rows1[i].id,
														title : rows1[i].title,
														asin : rows1[i].asin,
														groups : rows1[i].group
												};
												usersArray.push(product);
											}
											conn.release();
											response.json({product_list:usersArray});
										} else {
											conn.release();
											response.json({product_list:[]});
										}
									} else {
										logger.error(err);
										conn.release();
										response.json({product_list:[]});
									}
								});
							}
						} else {
							conn.release();
							response.json({product_list:[]});
						}
					} else {
						logger.error (err);
						conn.release();
						response.json({product_list:[]});
					}
				});
			} else {
				if (keyword) {
					query1 = "SELECT * FROM product WHERE title like ? limit 100";
					par.push('%'+keyword+'%');
				} else if (productId){
					query1 = "SELECT * FROM product WHERE id = ? limit 100";
					par.push (productId);
				} 
				conn.query(query1,par, function (err, rows, fields) {
					if (!err) {
						if (rows.length > 0) {
							var usersArray = new Array();
							for (var i = 0; i < rows.length; i++) {
								var product = {
										id : rows[i].id,
										title : rows[i].title,
										asin : rows[i].asin,
										groups : rows[i].group
								};
								usersArray.push(product);
							}
							conn.release();
							response.json({product_list:usersArray});
						} else {
							conn.release();
							response.json({product_list:[]});
						}
					}
				});
			}
		});
	});
	
app.get('/modifyProductPage', function (request, response) {
	var sess = request.mySession;
	if(!sess.username || sess.role !== 'admin') {
		response.redirect('/');
	}
	response.render('modifyProductPage.html');
	
	});
	
	app.post('/modifyProduct', function (request, response) {
		var sess = request.mySession;
		if(!sess.username || sess.role !== 'admin') {
			response.redirect('/');
		}
		connection.getConnection(function(err,conn){
			if (err) {
				logger.error(err);
				response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
			}
			conn.query("Update product set title = ? where id = ?",[request.body.title,request.body.id], function(err,rows,field){
				if (!err) {
					conn.release();
					response.json({'status' : 's', 'message' : 'The product has been updated'});
				} else {
					conn.release();
					console.log(err);
					response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
				}
			});
		});
	});
	
	app.post('/buyProduct', function (request, response) {
		var sess = request.mySession;
		if(!sess.username) {
			response.json({'status' : 'f', 'message' : '02 you need to log in prior to buying a product.'});
		}
		if (!request.body.productId) {
			logger.error(err);
			response.json({'status' : 'f', 'message' : 'Need to enter product id.'});
		}
		connection.getConnection(function(err,conn) {
			if (err) {
				logger.error(err);
				response.json({'status' : 'f', 'message' : 'There was a problem with connection.'});
			}
			
			conn.query("select * from product where id = ?",[request.body.productId], function(err,rows,field){
				if (!err) {
					
					if (rows.length > 0) {
						if (rows[0].available > 0) {
							
							conn.query("update product set available = available-1, sold =sold+1 where id = ?; insert into orders (productID, user) values (?,?)",[request.body.productId,request.body.productId, sess.username], function(err,rows,fields){
								if (err) {
									console.log(err);
									response.json({'status' : 'f', 'message' : 'There was a problem with connection.'});
								}
								conn.release();
								response.json({'status' : 's', 'message' : '01 the purchase has been made successfully'});
								
							});
						} else {
							conn.release();
							response.json({'status' : 'f', 'message' : '03 that product is out of stock'});
						}
					} else {
						
						conn.release();
						response.json({'status' : 'f', 'message' : 'Product not found in inventory!'});
					}
				} else {
						
					conn.release();
					console.log(err);
					response.json({'status' : 'f', 'message' : 'There was a problem with connection.'});
				}
			});
		
		});
	});
	
	app.get('/getOrders',function(request, response) {
		var sess = request.mySession;
		if(!sess.username || sess.role !== 'admin') {
			response.json({'status' : 'f', 'message' : '02 you need to log in prior to buying a product.'});
		}
		connection.getConnection (function (err, conn){
			if (err) {
				logger.error(err);
				response.json({'status' : 'f', 'message' : 'There was a problem with connection.'});
			}
			conn.query("select productID, count(productID) count from orders group by productID order by count(productID) desc",function(err,rows,fields){
				if (err) {
					conn.release();
					logger.error(err);
					response.json({'status' : 'f', 'message' : 'There was a problem with connection.'});
				}
				if (rows.length > 0) {
					var orders = [];
					for (var  i = 0; i < rows.length; i++) {
						var productID = rows[i].productID;
						var quantitySold = rows[i].count;
						
						orders.push({'productId' : productID, 'quantitySold' : quantitySold});
					}
					conn.release();
					response.json({'status' : 's', 'orders' : orders});
				} else {
					conn.release();
					response.json({'status' : 's', 'orders' : []});
				}
			});
		});
	});
	

};
