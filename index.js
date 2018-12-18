var envFixer = require('./environment_fixer.js');
envFixer.loadEnv(); // the env files keep carrying over the wrong linebreaks and for some reason putty wont let me insert unescaped newlines


// express
express = require('express');
app = express();

// templates
ejs = require('ejs');



// FWF tools
var FBToolsClass = require('./fwf_functions.js');
FBTools = new FBToolsClass();

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
	cookie: {},
	store: store,
	resave: false,
	saveUninitialized: false,
	unset: "destroy" // 'destroy' deletes from session store. 'keep' leaves in store
}
if(process.env.APP_ENVIRONMENT === 'production') {
	app.set('trust proxy', 1) // trust first proxy
	sesssionOptions.cookie.secure = true // serve secure cookies
}
app.use(session(sesssionOptions));
// ======= sessions END

// set access control for testing
app.use(function (req, res, next) {
    // Website you wish to allow to connect

    // set allowed reqwuests
    if(process.env.APP_ENVIRONMENT === "local"){
	    res.setHeader('Access-Control-Allow-Origin', '*');
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
app.use((req, res, next)=>{

   var data = "";
   req.on('data', (chunk)=>{ data += chunk})
   req.on('end', ()=>{
	   req.rawBody = data;
	   next();
   });

   console.log("\n========== REQUEST ==========");
   console.log(String(req.method) + " " + String(req.originalUrl));

});

// parse body into query if not GET
app.use((req, res, next)=>{

	if(req.rawBody){

		if( req.get('content-type')!="application/json" ){

			var parsedJSON = JSON.parse( req.rawBody );
			if(typeof parsedJSON === "object"){

				for(paramName in parsedJSON){
					req.query[ paramName ] = parsedJSON[ paramName ];
				}

			}

		} // add more types here
	}

	next();
});


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

app.all('/logout', (req,res)=>{

	if(req.session) req.session = null; // or call req.session.destroy()

	// try to get redirect
	var redirect = false;
	if(req.query.redirect){
		res.redirect( String(req.query.redirect) );
		res.end();
	}else{
		res.set('Content-Type', 'text/plain');
		res.send("logged out");
	}

});

app.get('/cv', function (req, res) {
	res.render('cv2');
})

app.get('/cv0', function (req, res) {
	res.render('cv0');
})

app.get('/cv2', function (req, res) {
	res.render('cv2');
})


// =============== FWF TOOL START  =============== 
app.get('/fwf_tool', (req,res)=>{

	/* LANDING:
	
	is user logged in with session?
		YES:
			send to fwf_logged_in if session missing or FB indicates logged out, redirect to logout.
		NO:
			send to fwf_login and request permissions
	
	*/

	// is user logged in with session?
	var isLoggedIn = false;
	if(typeof req.session.fwf_facebook_loggedin != "undefined" && req.session.fwf_facebook_loggedin === true){
		
		// send to fwf_logged_in do on-page FB login check, if not logged in, redirect to logout.
		res.set('Content-Type', 'text/plain')
		res.status(200)
		res.send("show page!");

		// res.render('fwf_logged_in');
		// res.end();

	}else{

		// send to fwf_login and request permissions
		/* FWF_LOGIN
		display fwf_login page and request permissions
		on clientside:
			is user already logged in with facebook?
				send AJAX POST userID, accessToken, expiresIn 
				check member of FWF?
				save to session and mark as logged in
				send to fwf_logged_in
			

		*/
		res.render('fwf_login');		
		res.end();

	}

})// fwf_tool

// =============== FWF TOOL END  =============== 



app.get('/fwf_test', function (req, res) {


	// check logged in
	var isLoggedIn = false;
	if(typeof req.session.fwf_facebook_loggedin != "undefined" && req.session.fwf_facebook_loggedin === true){
		isLoggedIn = true;

		res.set('Content-Type', 'text/plain')
		res.status(200)
		res.send("show page!");
	}else{

	}

	var pageData = {
		"fwf_facebook_loggedin": isLoggedIn
	}


	res.render('fwf_test');
})

app.get('/fwf_test/facebook_oauth_redirect', function (req, res) {
	res.send("facebook_oauth_redirect");
})

app.post('/fwf_ajax/:ajax_request_type', function (req, res) {
	console.log("routed POST /fwf_ajax/:ajax_request_type", String(req.params.ajax_request_type));

	// put posted json in req.params
	var postJSON = JSON.parse(req.rawBody);
	if( req.get('content-type')!="application/json" || !postJSON) res.status(400).send("check json");
	var keys = Object.keys(postJSON);
	for (var i = 0; i < keys.length; i++) {
		req.params[ keys[i] ] = postJSON[ keys[i] ];
	};

	console.log("req.params:\r\n", req.params);

	if(!req.params.ajax_request_type){
		res.set('Content-Type', 'text/plain')
		res.status(500)
		res.send("missing input");
	}else{
		var requestType = String(req.params.ajax_request_type).toLowerCase();
	}


	if( requestType === "check_member_login" ){

		if( !req.params.userid || !req.params.accesstoken || !req.params.expiresin ){
			// check required params
			/*{
				ajax_request_type:'check_member_login',
				userid:'10159746616590083',
				accesstoken:'EAAVFbCQf8UUBACNUeEbfisthRjZABF2XJfqgUAJ4ZCnUcHYGZArQjoqpn6SpLyJBGN3CCCx8xlbQmWKCj7ZBg2WklcBb6T9ZCPWm0fhE4jZCIZATNLPdIAc2JcXUwbbKOOkHUwRUZA9BqxeVphIz1OxZBB6coF3ORGlkTBAa05VyFIZB5YTM5kDUOD18EQT8hqmWeBhOfmnh8gzgZDZD',
				expiresin:'4137'
			}*/
			res.set('Content-Type', 'text/plain')
			res.status(500)
			res.send("missing input");
		}else{

			// add params to session
			req.session["fb_enc_accesstoken"] = Util.enc(req.params.accesstoken);
			req.session["fb_enc_userid"] = Util.enc(req.params.userid);
			req.session["fb_expiresin"] = req.params.expiresin; // expiry in seconds
			var d = new Date().valueOf();
			req.session["fb_expiresat"] = d + (req.params.expiresin * 1000);

			// check if member
			FBTools.getUserGroups(req.params.userid, req.params.accesstoken).then((obj)=>{
				// resolve
				var isFWFMember = false;
				for (var i = 0; i < obj.groups.length; i++) {
					if(String(obj.groups[i].id) === String(FBTools.FWF_GROUP_ID)){
						isFWFMember = true;
						break;
					}
				};

				if(isFWFMember){
					req.session["fwf_facebook_loggedin"] = true;
				}

				res.set('Content-Type', 'application/json')
				res.status(200)
				res.send( JSON.stringify({"is_fwf_member":String(isFWFMember)}) );

			},(obj)=>{
				// reject
				res.set('Content-Type', 'application/json')
				res.status(500)
				res.send( JSON.stringify({"group lookup ailed":String(isFWFMember)}) );

			})

		}


			
	}


	if( requestType == "group_member_check" ){

		// check accessToken and userid exists
		if(!req.params.accesstoken || !req.params.userid){
			res.set('Content-Type', 'text/plain')
			res.status(500)
			res.send("accessToken not set");
		}else{
			var accessToken = req.params.accesstoken
			var userId = req.params.userid
			// save to this session
			req.session["fb_enc_accesstoken"] = Util.enc(accessToken);
			req.session["fb_enc_userid"] = Util.enc(userId);
		}

		FBTools.isFoodWithFriendsMember(userId, accessToken).then((obj)=>{

			var isFWFMember = obj.isfwfmember;
			var responseJSON = {
				"isfwfmember":isFWFMember,
				"userid":userId
			}
			res.set('Content-Type', 'application/json')
			res.status(200)
			res.send( JSON.stringify(responseJSON) );

		},(obj)=>{
			console.log("isFoodWithFriendsMember rejected", obj);
			res.set('Content-Type', 'text/plain')
			res.status(500)
			res.send("isFoodWithFriendsMember rejected");
		})

	}

})


app.get('/', function (req, res) {
	res.set('Content-Type', 'text/plain');
	res.send("hiya");
})


// any uncaptured ones
app.all('*', function (req, res) {
	res.status(404).send("page not found");
})
// ==== routing end



// ==== start listening
app.listen(app.get('port'), function() {
  console.log('Node('+process.version+') app is running on port', app.get('port'));
  if(process.env.APP_ENVIRONMENT!="production") console.log("process.env:\r\n",process.env);
});

