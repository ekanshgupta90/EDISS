/**
 * EDISS@./app/routes.js
 * @author egupta
 * @description All the rest call will be directed to this script.
 */

module.exports = function (app,connection,logger, bodyParser, session) {

	
	/**
	 * Client side session creation. 
	 */
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

	/**
	 * GET - / -> home directory
	 */
	app.get('/', function (request, response){
		//logger.info("Home page request!");
		var sess = request.mySession;
		
		if (sess.username) {
			response.redirect('/home');
		} else {
			response.render('users.html',{message:""});
		}
	});
	
	/**
	 * GET - /loginPage -> Login Page for the application
	 */
	app.get('/loginPage', function (request, response){
		//logger.info("Login page request!");
		
		var sess = request.mySession;
		
		if (sess.username) {
			response.redirect('/home');
		} else {
			response.render('login.html');
		}
	});
	
	/**
	 * GET - /register -> Registering a new user.
	 */
	app.get('/register', function (request, response){
		//logger.info("Signup page request!");
		var sess = request.mySession;
		
		if (sess.username) {
			response.redirect('/home');
		} else {
			response.render('signup.html',{status:'',message:"account has been registered"});
		}
	});
	
	app.get('/getSession', function (request, response){
		//logger.info("Session check request!");
		var sess = request.mySession;
		
		if (sess.username) {
			response.json({username:sess.username, role:sess.role, sessionId:sess.sessionId});
		} else {
			response.json({username:''});
		}
		
	});
	
	/** Needs to be post not get
	 * @author egupta
	 * 
	app.get('/logout', function (request, response){
		logger.info("Session check request!");
		var sess = request.mySession;
		
		if (sess.username) {
			sess.username = '';
			sess.role = '';
			sess.sessionId = '';
			response.cookie('mySession', sess)
			response.json({message:"You have been logged out"});
		} else {
			response.redirect('/');
			response.json({message:"You are not currently logged in"});
		}
		
	});
	*/
	
	/**
	 * POST - /logout -> Logs out user session
	 */
	app.post('/logout', function (request, response){
		logger.info("Logout Action");
		var sess = request.mySession;
		
		if (sess.username) {
			sess.username = '';
			sess.role = '';
			sess.sessionId = '';
			response.cookie('mySession', sess)
			response.json({message:"You have been logged out"});
		} else {
			//response.redirect('/');
			response.json({message:"You are not currently logged in"});
		}
		
	});
	
	/**
	 * GET - /viewUsersPage -> UI Page request for Users  
	 */
	app.get('/viewUsersPage', function (request, response) {
		//logger.info("Logout Action");
		var sess = request.mySession;
		logger.debug(sess.username + sess.role);
		if(!sess.username || sess.role !== 'admin') {
			response.redirect('/');
		}
		response.render('viewUser.html');
	});
	
	app.get('/viewUsers', function (request, response) {
		logger.info("Admin Users");
		var sess = request.mySession;
		if(!sess.username && sess.role !== admin) {
			response.redirect('/');
		} else {
			logger.debug(request.query.search);
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
					logger.error(err);
					response.json({user_list:[]});
				}
				conn.query(query1,key, function (err, rows, fields) {
					conn.release();
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
							response.json({user_list:usersArray});
						} else {
							response.json({user_list:[]});
						}
					}
				});
			});
		}
	});
	
	app.get('/profilePage', function (request, response){
		//logger.info("Session check request!");
		var sess = request.mySession;
		
		if (sess.username) {
			response.render('profile.html');
		} else {
			response.redirect('/');
		}
		
	});
	
	app.get('/profile', function (request, response){
		logger.info("Profile Page!");
		var sess = request.mySession;
		logger.debug(sess.username);
		if (sess.username) {
			connection.getConnection(function(err,conn){
				if (err) {
					logger.error(err);
					response.json({});
				}
				conn.query('SELECT * FROM User_Details WHERE uName = ?',[sess.username],function (err,rows,field) {
					conn.release();
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
		logger.info("Register User -" + request.body.email);
		var success = true;
		connection.getConnection(function(err,conn){
			if(err) {
				logger.error(err);
				response.json({'status' : 'f', 'message' : 'there was a problem with your registration'});
			} else {
				conn.query("select * from User_Details where email = ?",[request.body.email], function (error, rows, fields) {
					if (!error) {
						if (!(rows.length > 0)) {
							conn.query("INSERT INTO User_Details (fName,lName,address,city,state,zip,email,uName) values (?,?,?,?,?,?,?,?); " +
									"INSERT INTO Users (uName,password,role) values (?,?,?)",
									[request.body.fname, request.body.lname, request.body.address, request.body.city, request.body.state, request.body.zip, 
									request.body.email, request.body.username,request.body.username, request.body.password,'user'],
									function (error, rows, fields) {
								conn.release();
								if (!error) {
									logger.info("User Created - " + request.body.username);
									response.json({'status' : 's', 'message' : 'account has been registered'});
								} else {
									logger.error(error);
									success = false;
									response.json({'status' : 'f', 'message' : 'there was a problem with your registration'});
								}
							});
						} else {
							conn.release();
							logger.info("Duplicate User - " + request.body.username);
							success = false;
							response.json({'status' : 'f', 'message' : 'there was a problem with your registration'});
						}
					} else {
						conn.release();
						logger.error(error);
						success = false;
						response.json({'status' : 'f', 'message' : 'there was a problem with your registration'});
					}
				});
			}
		});
	});
	
	app.post('/updateInfo', function (request, response) {
		logger.info("Update user ");
		var sess = request.mySession;
		
		if (!sess.username) {
			response.redirect('/');
		} else {
			logger.info("Update user - " + request.body.email);
			var success = true;
			var query1 = '', mess = [];
			
			if (!request.body.fname) {
				fname = '';
			} else {
				fname = request.body.fname;
			} 
			if (!request.body.lname) {
				lname = '';
			} else {
				lname = request.body.lname;
			}
			if (!request.body.address) {
				address = '';
			} else {
				address = request.body.address;
			}
			if (!request.body.city) {
				city = '';
			} else {
				city = request.body.city;
			}
			if (!request.body.state) {
				state = '';
			} else {
				state = request.body.state;
			}
			if (!request.body.email) {
				email = '';
			} else {
				email = request.body.email;
			}
			connection.getConnection(function(err,conn){
				if(err) {
					logger.error(err);
					response.json({'status' : 'f', 'message' : 'Connection Error!'});
				} else {
					conn.query("Update User_Details set fName = ?,lName = ?,address = ?,city = ?,state = ?, uName = ? where email = ?",
							[fname, lname, address, city, state, 
							 request.body.username,request.body.email], function (err1,rows1,field1) {
						conn.release();
						if (!err1) {
							response.json({'status' : 's', 'message' : 'Your information has been updated'});
						} else {
							logger.debug(err1);
							response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
						}
					});
			}});
		}
	});
	
	app.get('/healthCheck', function(request,response) {
		response.statusCode = 200;
		response.send();
	});

	app.post('/login', function (request, response) {
		logger.info("User Login");
		var sess = request.mySession;
		logger.debug(request.body.username + request.body.password);
		
		logger.debug ('going to db login');
		
		connection.getConnection(function(err,conn){
			if(err) {
				logger.error(err);
				response.json({status:'f',username:'',err_message:"Username and password combination is incorrect",sessionId:"",menu:[]});
			}
			
			conn.query("SELECT * FROM Users WHERE uName = ? AND password = ?",[request.body.username,request.body.password], function (error, rows, fields) {
				conn.release();
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
						response.json({status:'s',username:request.body.username,err_message:"",sessionID:sess.sessionId,menu:['search','update_product','view_user']});
					} else {
						sess.role = 'user';
						response.cookie('mySession', sess);
						response.json({status:'s',username:request.body.username,err_message:"",sessionID:sess.sessionId,menu:['search','getProducts']});
					}
				} else {
					response.json({status:'f',username:'',err_message:"Username and password combination is incorrect",sessionId:"",menu:[]});
				}
			});
		});
		
				
	});
	
	app.get('/getProducts', function (request, response) {
		logger.info("Get Products");
		var productId = null;
		if (request.query.productId) {
			 productId = request.query.productId;
			 logger.debug(productId);
		}
		var keyword = null;
		if (request.query.keyword) {
			 keyword = request.query.keyword;
			 logger.debug(keyword);
		}
		var category = null;
		if (request.query.category) {
			 category = request.query.category;
			 logger.debug(category);
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
					conn.release();
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
											
											response.json({product_list:usersArray});
										}
									} else {
										logger.error(err);
										
										response.json({product_list:[]});
									}
								});
							} else {
								
								query1 = "SELECT * FROM product WHERE id in (" + id_str + ") limit 100";
								
								conn.query(query1,function(err,rows1,fields){
									conn.release();
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
											
											response.json({product_list:usersArray});
										} else {
											
											response.json({product_list:[]});
										}
									} else {
										logger.error(err);
										
										response.json({product_list:[]});
									}
								});
							}
						} else {
							
							response.json({product_list:[]});
						}
					} else {
						logger.error (err);
						
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
					conn.release();
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
						
							response.json({product_list:usersArray});
						} else {
							
							response.json({product_list:[]});
						}
					}
				});
			}
		});
	});
	
	app.get('/modifyProductPage', function (request, response) {
		logger.info("Modify Prodcut");
		var sess = request.mySession;
		if(!sess.username || sess.role !== 'admin') {
			response.redirect('/');
		} else {
			response.render('modifyProductPage.html');
		}
	});
	
	app.post('/modifyProduct', function (request, response) {
		var sess = request.mySession;
		if(!sess.username || sess.role !== 'admin') {
			response.redirect('/');
		} else {
			connection.getConnection(function(err,conn){
				conn.release();
				if (err) {
					logger.error(err);
					response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
				}
				conn.query("Update product set title = ? where id = ?",[request.body.title,request.body.id], function(err,rows,field){
					if (!err) {
						
						response.json({'status' : 's', 'message' : 'The product has been updated'});
					} else {
						
						logger.debug(err);
						response.json({'status' : 'f', 'message' : 'There was a problem with your updation'});
					}
				});
			});
		}
	});
	
	app.post('/buyProduct', function (request, response) {
		logger.info("Buy Product");
		var sess = request.mySession;
		if(!sess.username) {
			response.json({'status' : 'f', 'message' : '02 you need to log in prior to buying a product.'});
		} else {
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
									conn.release();
									if (err) {
										logger.debug(err);
										response.json({'status' : 'f', 'message' : 'There was a problem with connection.'});
									}
									
									response.json({'status' : 's', 'message' : 'purchase has been made successfully'});
									
								});
							} else {
								
								response.json({'status' : 'f', 'message' : 'product is out of stock'});
							}
						} else {
							
							
							response.json({'status' : 'f', 'message' : 'Product not found in inventory!'});
						}
					} else {	
						conn.release();
						logger.debug(err);
						response.json({'status' : 'f', 'message' : 'There was a problem with connection.'});
					}
				});
			
			});
		}
		
	});
	
	app.get('/getOrders',function(request, response) {
		logger.info("Get Orders");
		var sess = request.mySession;
		if(!sess.username || sess.role !== 'admin') {
			response.json({'status' : 'f', 'message' : 'you need to log in prior to buying a product.'});
		} else {
			connection.getConnection (function (err, conn){
				if (err) {
					logger.error(err);
					response.json({'status' : 'f', 'message' : 'There was a problem with connection.'});
				}
				conn.query("select productID, count(productID) count from orders group by productID order by count(productID) desc",function(err,rows,fields){
					conn.release();
					if (err) {
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
						
						response.json({'status' : 's', 'orders' : orders});
					} else {
						
						response.json({'status' : 's', 'orders' : []});
					}
				});
			});
		}
	});
	

};
