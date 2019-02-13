let base_MongoDB = require('./base_MongoDB.js');

class foodWithFriends_DB extends base_MongoDB{

	constructor(){
		super();

		this.users_collection = "foodwithfriends_users";
		this.events_collection = "foodwithfriends_events";
	}

	addAvailableDays(_facebookUserID, _availableDaysArray){
		return new Promise((resolve, reject)=>{
			this.db().then((obj)=>{
				if(!obj.db) return reject(obj);

				let selector = {"fb_env_id":_facebookUserID};

				let update = {
					$set: {"days":_availableDaysArray} 
				}

				let options = {
					upsert: true
				}

				obj.db.collection(this.users_collection).updateOne(selector, update, options, (err,result)=>{
					if(err) return reject(err);

					console.log("updated", result);
					return resolve({"success":true});

				});
			});
		});
	}

	checkAvailability(){
		return new Promise((resolve, reject)=>{
			this.db().then((obj)=>{
				if(!obj.db) return reject(obj);
				// get all in collection
				obj.db.collection(this.users_collection).find({}).toArray((err,docs)=>{
					if(err) return reject (err);
					console.log("cool docs",docs);
					return resolve(docs);
				})
			})
		});
	}
}

module.exports = foodWithFriends_DB;