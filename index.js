var envFixer = require('./environment_fixer.js');
envFixer.loadEnv(); // the env files keep carrying over the wrong linebreaks and for some reason putty wont let me insert unescaped newlines

// express
var express = require('express');
var app = express();

// templates
var ejs = require('ejs');

// utility
var UtilityClass = require('./utility.js');
Util = new UtilityClass();

// view engine
app.set('view engine','ejs');

// port
app.set('port', (process.env.PORT || 3000));

// undeclared paths search the public folder
app.use(express.static(__dirname + '/public'));

// ======= sessions START
var session;
if(process.env.INTERNET_OFF && process.env.INTERNET_OFF!="true"){ //TODO Add this param to the other ENV files
	var assert = require('assert');
	session = require('express-session');
	MongoDBStore = require('connect-mongodb-session')(session);
	var store = new MongoDBStore({
		uri: process.env.GALLMONDNET_MONGODB_URL,
		collection: 'sessions'
	});
	store.on('error', function(error) {
		assert.ifError(error);
		assert.ok(false);
	});
	var sesssionOptions = {
		secret: '9LM5HI5T',
		cookie: {httpOnly:false},
		store: store,
		resave: false,
		saveUninitialized: false,
		unset: "destroy" // 'destroy' deletes from session store. 'keep' leaves in store
	}
	if(process.env.APP_ENVIRONMENT === 'production') {
		app.set('trust proxy', 1) // trust first proxy
		sesssionOptions.cookie.secure = false; // serve secure cookies
	}
	app.use(session(sesssionOptions));
}
// ======= sessions END

// set access control for testing
app.use(function (req, res, next) {
    // set allowed reqwuests
    if(process.env.APP_ENVIRONMENT === "local"){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('X-Frame-Options', 'allow-from https://www.facebook.com/');
    }else{
    	console.log("process.env.APP_DOMAIN", process.env.APP_DOMAIN);
    	res.setHeader('Access-Control-Allow-Origin', String(process.env.APP_DOMAIN));
    }
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// grab body data and insert into req.rawBody
app.use((req, res, next) => {
	var data = "";
	req.on('data', (chunk) => { data += chunk })
	req.on('end', () => {
		req.rawBody = data;
		console.log( (req.rawBody!=""? "Body: " + String(req.rawBody):"") );
		next();
	});
	console.log("\n========== REQUEST ==========");
	console.log(String(req.method) + " " + String(req.headers.host) + String(req.originalUrl));
});

// parse body into query if not GET
app.use((req, res, next)=>{
	if(req.rawBody){
		if( req.get('content-type').indexOf("application/json") != -1 ){
			var parsedJSON = JSON.parse( req.rawBody );
			if(typeof parsedJSON === "object"){
				for(paramName in parsedJSON){
					req.query[ paramName ] = parsedJSON[ paramName ];
				}
			}
		} //TODO add more content type parsing for post body
	}
	next();
});

// echo utility
app.all('/echo', (req, res)=>{
	// get headers
	var headers = req.headers;
	var headerKeys = Object.keys(headers);
	var headersArr = [];
	for (var i = headerKeys.length - 1; i >= 0; i--) {
		headersArr.push( String(headerKeys[i])+": "+String(headers[headerKeys[i]]) );
	};
	var headersString = headersArr.join("\n");
	// get GET
	var params = req.query;
	var paramsKeys = Object.keys(params);
	var paramsArr = [];
	for (var i = paramsKeys.length - 1; i >= 0; i--) {
		// if this param is multiples
		var thisParam = "";
		if(typeof params[paramsKeys[i]] === "object"){
			for (var z = 0; z < params[paramsKeys[i]].length; z++) {
				params[paramsKeys[i]][z]
				paramsArr.push( String(paramsKeys[i])+": "+String(params[paramsKeys[i]][z]) );
			};
		}else{
			paramsArr.push( String(paramsKeys[i])+": "+String(params[paramsKeys[i]]) );
		}
	};
	var paramsString = paramsArr.join("\n");
	// get POST
	var bodyString = (req.rawBody===undefined?"":req.rawBody);
	// arrange response
	var responseArr = [
		"// ===== headers",
		headersString,
		"// ===== GET",
		paramsString,
		"// ===== BODY",
		bodyString
	]
	var responseString = responseArr.join("\n");
	// set response header
	res.set('Content-Type', 'text/plain');
	res.send(responseString);
});

// session killer. Use a 'redirect' param to send somewhere afterwards
app.all('/logout', (req,res)=>{
	if(req.session) req.session = null; // or call req.session.destroy()
	// try to get redirect
	if(req.query.redirect){
		res.redirect( String(req.query.redirect) );
		res.end();
	}else{
		res.set('Content-Type', 'text/plain');
		res.send("logged out");
	}
});


var CV_SITE_CLASS = require("./projects/cv_website");
var CV_Site = new CV_SITE_CLASS(app);

var FoodWithFriendsClass = require("./projects/foodwithfriends");
var FoodWithFriends = new FoodWithFriendsClass(app);


app.get('/', function (req, res) {
	res.set('Content-Type', 'text/plain');
	res.send("hiya");
})


// 404
app.all('*', function (req, res) {
	res.status(404).send("page not found");
})


// ==== start listening
// app.listen(app.get('port'), function() {
// 	console.log('Node('+process.version+') app is running http on port', app.get('port'));
// });

// local https for testing
if(process.env.APP_ENVIRONMENT == "local"){
	var fs = require('fs');
	var https = require('https');
	var privateKey  = fs.readFileSync('ssl/local-key.pem', 'utf8');
	var certificate = fs.readFileSync('ssl/client-cert.pem', 'utf8');
	var credentials = {key: privateKey, cert: certificate};
	var httpsServer = https.createServer(credentials, app);
	httpsServer.listen(3448);
	console.log('Node('+process.version+') app is running https on port', 3448);
}
