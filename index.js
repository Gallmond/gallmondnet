if(!process.env.APP_ENVIRONMENT || process.env.APP_ENVIRONMENT==="local"){
	var fs = require('fs');
	var envString = fs.readFileSync("./.env", {encoding:"utf-8"});
	var splitEnv = envString.split("\r\n");
	for(var i = 0; i<splitEnv.length; i++){
		var eIndex = splitEnv[i].indexOf("=");
		var left = splitEnv[i].substring(0,eIndex);
		var right = splitEnv[i].substring(eIndex+1);
		process.env[left] = right;
	}
}

// express
express = require('express');
app = express();

// templates
ejs = require('ejs');

// FWF tools
var FBToolsClass = require('./fwf_functions.js');
FBTools = new FBToolsClass();

// view engine
app.set('view engine','ejs');

// port
app.set('port', (process.env.PORT || 3000));

// undeclared paths search the public folder
app.use(express.static(__dirname + '/public'));

// for parsing ajax
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// set access control for testing
app.use(function (req, res, next) {
    // Website you wish to allow to connect

    // set allowed reqwuests
    if(process.env.APP_ENVIRONMENT === "local"){
	    res.setHeader('Access-Control-Allow-Origin', '*');
    }else{
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


app.get('/cv', function (req, res) {
	res.render('cv2');
})

app.get('/cv0', function (req, res) {
	res.render('cv0');
})

app.get('/cv2', function (req, res) {
	res.render('cv2');
})

app.get('/fwf_test', function (req, res) {
	res.render('fwf_test');
})
app.get('/fwf_test/facebook_oauth_redirect', function (req, res) {
	res.send("facebook_oauth_redirect");
})

app.post('/fwf_ajax/:ajax_request_type', function (req, res) {

	console.log("routed post /fwf_ajax/:ajax_request_type", String(req.params.ajax_request_type));

	// put posted json in req.params
	var postJSON = JSON.parse(req.rawBody);
	if( req.get('content-type')!="application/json" || !postJSON) res.status(400).send("check json");
	var keys = Object.keys(postJSON);
	for (var i = 0; i < keys.length; i++) {
		req.params[ keys[i] ] = postJSON[ keys[i] ];
	};


	if(!req.params.ajax_request_type){
		res.set('Content-Type', 'text/plain')
		res.status(500)
		res.send("missing input");
	}else{
		var requestType = String(req.params.ajax_request_type).toLowerCase();
	}

	if( requestType == "group_member_check" ){

		console.log("group_member_check", req.params);

		// check accessToken and userid exists
		if(!req.params.accesstoken || !req.params.userid){
			res.set('Content-Type', 'text/plain')
			res.status(500)
			res.send("accessToken not set");
		}else{
			var accessToken = req.params.accesstoken
			var userId = req.params.userid
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
});

