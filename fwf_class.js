class foodWithFriends{

    constructor(){

        this.FWF_GROUP_ID = "757102684394117"; // from my own user group list. Also it's the one in the URL for the group itself        
        this.mongoClient = require('mongodb').MongoClient;
        this.dbClient;

        return this;

    }

    async db(){
        var result = await this.dbPromise();
        return result;          
    }

    dbPromise(){
        return new Promise((_pobj)=>{
            if(this.dbClient){
                return _pobj({"success":true, "dbClient":this.dbClient});
            }
            // create dbClient
            this.mongoClient.connect(process.env.GALLMONDNET_MONGODB_URL, { useNewUrlParser: true }, (err, client)=>{
                if(err){
                        console.log("err could not connect to mongodb", err);
                        return _pobj({"error":"err could not connect to mongodb", "info": err});
                }
                this.dbClient = client;
                return _pobj({"success":true, "dbClient":client});
            });
        });
    }

    clientExists(){
        if(this.dbClient){
            console.log("client was made", this.dbClient);
            console.log("client was made");
        }else{
            console.log("was not made", this.dbClient);
            console.log("was not made");
        }
    }

}

module.exports = foodWithFriends;