/*
lineReader will extract the records from amazon-meta.txt one at a time as
file is too large to read all at once.  In order to add records to a database you need to add code below to insert records

This code depnds on "line-reader"

You need to install line-reader by using the following command:
npm install line-reader

*/
var lineReader = require('line-reader');
var mysql = require('mysql');

var record = new Object();
record.categories = [];
var jsonRecord;
var already = false;
var categories = false;
var counter = 0;
var countMAX = 2000;
var timeMAX = 500;
var waiter = 1000;
var batchgo = [];
var batchcatgo = [];
var times = 0;
var unlock = true;

var connection = mysql.createConnection({
	host: 'localhost',
	user:'root',
	password: '',
	database: 'Project1_db',
	charset: 'utf8'
});

connection.connect();

lineReader.eachLine('amazon-meta.txt', function(line, last) {
  if(line === ""){
	  unlock = true;
  }
	
  if(line.indexOf("Id:")>=0 && unlock){
    if(already){
    	if(times > timeMAX)
    		return false;
    	if(counter++ > countMAX) {
    	  
    	  counter = 0;
    	  console.log('Processing records ' +  (times*countMAX) + ' to ' + (times*countMAX+(countMAX - 1)) + '\n');
    	  times++;
    	  
    	  var tempbatchgo = batchgo;
    	  var tempbatchcatgo = batchcatgo;
    	  
    	  batchgo = new Array();
  		  batchcatgo = new Array();
  		  
  		  //console.log("Query 1 ...");
  		  
  		  var query = "insert into `product` (`id`,`asin`,`title`,`group`) values ? ";
  		  connection.query(query, [tempbatchgo], function (err, rows, fields){
  			  if (!err) {
  				  
  			  } else {
  				  console.log('ERROR QUERY 1 - ' + tempbatchgo[0][0] + '\n' + err);
  				  return false;
  			  }
  		  });
  		  
  		 //console.log("Query 2 ...");
  		  
  		  query = "insert into `map` (`id`,`tag`) values ?";
  		  
  		  connection.query(query, [tempbatchcatgo], function (err, rows, fields){
  			  if (!err) {
  				  
  			  } else {
  				  console.log('ERROR QUERY 2 - ' + tempbatchcatgo[0][0] + '\n' + err);
  				  return false;
  			  }
  		  });
  		  
  		var end = Date.now() + waiter;
        while (Date.now() < end) ;
      }
    	
      var tempRecord = record;
      
      var param = [parseFloat(tempRecord.Id), tempRecord.ASIN, tempRecord.title, tempRecord.group];
      batchgo.push(param);
      
      for(var i = 0; i < record.categories.length; i++) {
    	  //console.log(tempRecord.Id +'\n'+ tempRecord.categories[i]);
    	  param = [parseFloat(tempRecord.Id),tempRecord.categories[i]];
    	  batchcatgo.push(param);
      }
      
      
      //reinitialize record and add Id value
      record = new Object();
      record.categories = [];
      record.Id = subStr;


    } else {
      already = true;
    }

  }
  if(line.indexOf("Id:")>=0 && unlock) {
	  unlock = false;
	  line = line.trim();
      var subStr = line.substring(line.indexOf("Id:")+3, line.length).trim();
      record.Id = subStr;
  }

  if(line.indexOf("ASIN:")>=0){
    //record the ASIN
	line = line.trim();
    var subStr = line.substring(line.indexOf("ASIN:")+5,line.length).trim();
    record.ASIN = subStr;
    //console.log(record.ASIN);
  }

  if(line.indexOf("title:")>=0){
    //record the title
	line = line.trim();
    var subStr = line.substring(line.indexOf("title:")+6,line.length).trim();
    subStr = subStr.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    
    record.title = subStr;
  } 

  if(line.indexOf("group:")>=0){
    //record the group
	line = line.trim();
    var subStr = line.substring(line.indexOf("group:")+6,line.length).trim();
    record.group = subStr;
  }

  if(line.indexOf("categories:")>=0 || categories){
    //Check if there are more categories to record and make sure we haven't started reading reviews
	if (line.indexOf("reviews:")>0) {
	    	categories = false;
	}
	  
	if(categories) {
    	line = line.trim();
        var subStr = line.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        record.categories.push(subStr) ;
    }
    
    if ((line.indexOf("categories:")>=0)){
      //record the categories -- there might be more than one category so have to continue reading until we get to "reviews"
      categories = true;
    }
  }



 if (last) {
	  console.log('Processing records ' +  (times*countMAX) + ' to ' + (times*countMAX+counter) + '\n');
	  
	  var tempbatchgo = batchgo;
	  var tempbatchcatgo = batchcatgo;
	  
	  batchgo = new Array();
	  batchcatgo = new Array();
		  
		  //console.log("Query 1 ...");
		  
		  var query = "insert into `product` (`id`,`asin`,`title`,`group`) values ? ";
		  connection.query(query, [tempbatchgo], function (err, rows, fields){
			  if (!err) {
				  
			  } else {
				  console.log(err);
				  return false;
			  }
		  });
		  
		 //console.log("Query 2 ...");
		  
		  query = "insert into `map` (`id`,`tag`) values ?";
		  
		  connection.query(query, [tempbatchcatgo], function (err, rows, fields){
			  if (!err) {
				  
			  } else {
				  console.log(err);
				  return false;
			  }
		  });
		  
	var end = Date.now() + waiter;
	while (Date.now() < end) ;
    return false; // stop reading
  }
});
