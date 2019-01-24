class foodWithFriends{

    constructor(){

        this.FWF_GROUP_ID = "757102684394117"; // from my own user group list. Also it's the one in the URL for the group itself        
        this.mongoClient = require('mongodb').MongoClient;
        this.dbClient;

        // create dbClient
        this.mongoClient.connect(process.env.GALLMONDNET_MONGODB_URL, { useNewUrlParser: true }, (err, client)=>{
            if(err){
                    console.log("err could not connect to mongodb", err);
            }
            this.dbClient = client;
        });

        return this;
    }

    clientExists(){
        if(this.dbClient){
            console.log("client was made", this.dbClient);
        }else{
            console.log("was not made", this.dbClient);
        }
    }

}

module.exports = foodWithFriends;