let baseProject = require('../baseProject.js');
// let foodWithFriends_DB = require('./foodWithFriends_DB.js');

class foodWithFriends extends baseProject{

    constructor(_app){
        super(_app);
        console.log("========== foodWithFriends constructor ==========");

        this.project_path = "projects/foodwithfriends/";

        // stuff specific to this project
        this.FWF_GROUP_ID = "757102684394117"; // the FoodWithFriends group ID from my own user group list. Also it's the one in the URL for the group itself.

    }

    set_routes(){
        this.landing_page();
        this.ajax_routes();
        
        this.test_calendar_page();
        
    };

    // ajax logic goes here
    ajax_routes(){
        this.routes["POST"]["ajax_handler"] = {
            'description':'all ajax logic should go in here',
            'paths':['/fwf_ajax/:ajax_request_type'],
            'callback':(req,res)=>{

                // check that a request type was set
                if(!req.params.ajax_request_type){
                    res.set('Content-Type', 'text/plain')
                    res.status(500)
                    res.send("missing input");
                }else{
                    var requestType = String(req.params.ajax_request_type).toLowerCase();
                }

                // check_member_login is the ajax request take takes passed-in token details and looks up group membership
                // if they're a member session token will be set to 'log' them into the fwf tool
                if(requestType === "check_member_login"){   

                    if( !req.query.userid || !req.query.accesstoken || !req.query.expiresin ){
                        this.missingInputResponse(res);
                    }else{

                        // add params to session
                        req.session["fb_enc_accesstoken"] = Util.enc(req.query.accesstoken);
                        req.session["fb_enc_userid"] = Util.enc(req.query.userid);
                        req.session["fb_expiresin"] = req.query.expiresin; // expiry in seconds
                        var d = new Date().valueOf();
                        req.session["fb_expiresat"] = d + (req.query.expiresin * 1000);

                        // check if this facebook user is a member of the food with friends group
                        // check if member
                        this.getUserGroups(req.query.userid, req.query.accesstoken).then((obj)=>{
                            var isFWFMember = false;
                            // check returned groups
                            for (var i = 0; i < obj.groups.length; i++) {
                                if(String(obj.groups[i].id) === String(this.FWF_GROUP_ID)){

                                    isFWFMember = true;
                                }
                            };
                            // if they're in the group, set logged in to true

                            if(isFWFMember){
                                req.session["fwf_facebook_loggedin"] = true;
                            }
                            // response for clientside ajax
                            res.set('Content-Type', 'application/json')
                            res.status(200)

                            res.send( JSON.stringify({"is_fwf_member":String(isFWFMember)}) );
                        },(obj)=>{
                            console.log("getUserGroups rejected", obj);
                            res.set('Content-Type', 'application/json')
                            res.status(500)

                            res.send( JSON.stringify({"group lookup failed":String(isFWFMember)}) );
                        });

                    }

                } else if(requestType === "submit_available_days"){

                    this.submitUserDates(req,res);

                }


            }
        }
    }

    // this is the landing page (the starting poitn)
    landing_page(){
        this.routes["GET"]["landing_page"] = {
            'description':'main landing page for the fwf tool. This is the start point where the automatic login check is performed',
            'paths':['/fwf'],
            'callback':(req,res)=>{
                // is user logged in with session?
                if(typeof req.session.fwf_facebook_loggedin != "undefined" && req.session.fwf_facebook_loggedin === true){
                   
                    // send to fwf_logged_in do on-page FB login check, if not logged in, redirect to logout.
                    // res.set('Content-Type', 'text/plain')
                    // res.status(200)
                    // res.send("show logged in page!");

                    this.calendar_page(req,res);

                }else{

                    var pagedata = {
                        "project_path": this.project_path
                    }
                    res.render('projects/foodwithfriends/fwf_login', pagedata);		
                    res.end();

                }

            }
        }
    }

    // the actual calendar page
    calendar_page(req,res){

        // what data does the page need?
        // - this users currently available days
        // - other users currently available days


        var pageData = {
            "my_available_days": [],
            "other_people_available_days":{},
            "project_path": this.project_path
        };
        res.render(this.project_path+'calendar_page', pageData);

    }


    // just shows the static calendar_test view and some test data, for testing the clientside js
    test_calendar_page(){
        this.routes["GET"]["test_calendar_page"] = {
            'description':'static calendar page for testing clientside js',
            'paths':['/cal'],
            'callback':(req,res)=>{
                // some pretent values for dev
                var pageData = {
                    "d": new Date().valueOf(),
                    "my_available_days": ["20190101","20190108","20190120","20190121"],
                    "other_people_available_days":{
                        "bob": ["20190101","20190108","20190120","20190121"],
                        "alice": ["20190107","20190114","20190116","20190117"],
                        "terry": ["20190102","20190103","20190104","20190105"],
                        "berry": ["20190102","20190103","20190104","20190105"]
                    },
                    "project_path": this.project_path
                }
                res.render(this.project_path+'calendar_test', pageData);
            }
        }
    }

    missingInputResponse(_res){
        _res.set('Content-Type', 'text/plain')
        _res.status(500)
        _res.send("missing input");
    }

    // submits new dates and returns 200 status with json response of availableDates containing all this users dates
    submitUserDates(_req, _res){
        console.log("submitUserDates");

        // needed params present?
        if( !_req.session["fb_enc_userid"] || !_req.query.availableDates ){
            this.missingInputResponse(_res);
        }else{

            // lookup user dates on mongodb

        }
    }


    // ========== FACEBOOK API LOGIC BELOW ==========
    // wrapper for sending requests to facebook's api
    // returns 'data' json object in successful response
    FAPI_Get(_url){
        return new Promise((resolve, reject)=>{
			var https = require('https');
			https.get(_url, (response)=>{
				var resString = "";
				var resChunks = [];
				response.on('data', (chunk)=>{
					resString += chunk;
					resChunks.push(chunk);
				});
				response.on('end', ()=>{
					if(resString === ""){
						return reject({success:false, info:"data was blank"});
					}
					var returnedJsonString = JSON.parse(resString);	
					return resolve({success:true, statusCode:response.statusCode, dataStr: resString, data: returnedJsonString});
				});
			}).on('error', (e) => {
				return reject({success:false, error:e, info:"http.get threw error in graphGET"});
			});
		});
    }

    // returns an array of groups in the 'groups' param of resolve obj
    getUserGroups(_userId, _accessToken){
        return new Promise((resolve, reject)=>{
			var graphsURL = "https://graph.facebook.com/" + String(_userId) + "/groups?access_token=" + String(_accessToken);
			this.FAPI_Get(graphsURL).then((obj)=>{
				if(!obj.data || !obj.data.data) return false;
				return resolve({success:true, groups:obj.data.data});
				/*{
				   "data": [
				      {
				         "name": "Tea Nerds",
				         "id": "1867199613399430"
				      },
				      {
				         "name": "Pub Gardens and Park Larking",
				         "id": "1894264080605087"
				      },
				      {
				         "name": "Food with Friends",
				         "id": "757102684394117"
				      },
				      {
				         "name": "Sunday roast club :)",
				         "id": "322561321428246"
				      },
				      {
				         "name": "Please can we go to the pub after work on Friday?",
				         "id": "615792048561868"
				      }
				   ],
				   "paging": {
				      "cursors": {
				         "before": "QVFIUlFzcGNld3k5TEVua2xtRzBhc0ZAObElwT1QxN0g5ZAk1OMF9LaHdXTDhFLWhhQTJzTS0wU3RVcndXdmg1M1Qya0l4UkxfQl9aT3BSNDQyaFpTbWQwQ2J3",
				         "after": "QVFIUkdieG8wQnIxcEZAqclZA4NGhKa1pUeThhZATRoOEhfLV95emd6UklQYkRjdEZAaaTVhUnVuemVZAbXJhOUptV3JJdTJlT2pTaGRuNVlUVEVRQVRvOVlnRXNR"
				      }
				   }
				}*/
			},(obj)=>{
				// console.log("reject", obj);
				return reject(obj);
			})
		});
    }
    // ========== FACEBOOK API LOGIC ABOVE ==========


}

module.exports = foodWithFriends;