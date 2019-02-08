class base_MongoDB{
	constructor(){
		this.debug = false;
		this.mongodb = require('mongodb');
        this.dbObj = false;
        this.dbClient = false;
        this.MONGODBURL = process.env.GALLMONDNET_MONGODB_URL
		this.MONGODB_DATABASENAME = process.env.GALLMONDNET_MONGODB_DATABASENAME;
		if(this.debug) console.log("base_MongoDB constructed");
	}
	async db(){
		if(this.debug) console.log("requesting async dbPromise");
		var result = await this.dbPromise();
		if(this.debug) console.log("dbPromise was returned");
        return result;
	}
	dbPromise(){
        return new Promise((_pobj)=>{
            if(this.dbObj){
				if(this.debug) console.log("this.dbObj exists");
                return _pobj({"success":true, "db":this.dbObj});
            }else{
                this.mongodb.connect(this.MONGODBURL+"/"+this.MONGODB_DATABASENAME, { useNewUrlParser: true }, (err, client)=>{
                    if(err){
						if(this.debug) console.log("this.mongodb.connect threw error", err);
                        return _pobj({"error":"err could not connect to mongodb", "info": err});
                    }else{
						if(this.debug) console.log("this.mongodb.connect created client");
                        this.dbClient = client;
                        this.dbObj = this.dbClient.db('gallmondnet');
                        return _pobj({"success":true, "db":this.dbObj});
                    }
                });
            }
        });
    }
}
module.exports = base_MongoDB;