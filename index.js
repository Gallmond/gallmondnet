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

// view engine
app.set('view engine','ejs');

// port
app.set('port', (process.env.PORT || 3000));

// undeclared paths search the public folder
app.use(express.static(__dirname + '/public'));

// grab body data and insert into req.rawBody
app.use((req, res, next)=>{
   var data = "";
   req.on('data', (chunk)=>{ data += chunk})
   req.on('end', ()=>{
	   req.rawBody = data;
	   next();
   });
});


app.all('/', (req, res)=>{

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



// any uncaptured ones
app.get('*', function (req, res) {
	res.status(404).send("page not found");
})
// ==== routing end



// ==== start listening
app.listen(app.get('port'), function() {
  console.log('Node('+process.version+') app is running on port', app.get('port'));
});

