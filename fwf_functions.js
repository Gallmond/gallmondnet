module.exports = function(){

	this.FWF_GROUP_ID = "757102684394117"; // from my own user group list. Also it's the one in the URL for the group itself

	this.graphGET = (_requestURL)=>{
		return new Promise((resolve, reject)=>{

			var https = require('https');
			https.get(_requestURL, (response)=>{
				// console.log('statusCode:', response.statusCode);
				// console.log('headers:', response.headers);

				var resString = "";
				var resChunks = [];
				response.on('data', (chunk)=>{
					// console.log('data');

					resString += chunk;
					resChunks.push(chunk);
				});
				response.on('end', ()=>{
					// console.log('end');
					if(resString === ""){
						return reject({success:false, info:"data was blank"});
					}
					var returnedJsonString = JSON.parse(resString);	
					// console.log("resString", resString);
					// console.log("returnedJsonString", returnedJsonString);

					return resolve({success:true, statusCode:response.statusCode, dataStr: resString, data: returnedJsonString});
				});
			}).on('error', (e) => {
				return reject({success:false, error:e, info:"http.get threw error in graphGET"});
			});

		});
	}// graphGET

	// passes 'groups' (array of objects) into resolve
	this.getUserGroups = (_userId, _accessToken)=>{
		return new Promise((resolve, reject)=>{
			var graphsURL = "https://graph.facebook.com/" + String(_userId) + "/groups?access_token=" + String(_accessToken);

			this.graphGET(graphsURL).then((obj)=>{
				// console.log("resolved", obj);
				if(!obj.data || !obj.data.data) return false;
				// console.log("obj.data.data", obj.data.data);
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
	}// getUserGroups

	// returns 'isfwfmember' (bool) in resolve obj
	this.isFoodWithFriendsMember = (_userId, _accessToken)=>{
		return new Promise((resolve, reject)=>{

			this.getUserGroups(_userId, _accessToken).then((obj)=>{
				if(!obj.success) return reject(obj);

				var groupsArr = obj.groups;
				var isFWFMember = false;

				for (var i = 0; i < groupsArr.length; i++) {
					if(groupsArr[i].id === this.FWF_GROUP_ID){
						isFWFMember = true;
						break;
					}
				};

				return resolve({success:true, isfwfmember:isFWFMember});


			},(obj)=>{
				return reject(obj);
			})

		});
	}

}