module.exports = class utility{
	
	constructor(){
		if(typeof crypto != "undefined"){
			this.crypto = crypto;
		}else{
			this.crypto = require('crypto');
		}

	}

	enc(_string){
		var algorithm = 'aes-256-ctr';
		var cipher = this.crypto.createCipher(algorithm,process.env.ENC_KEY);
		var crypted = cipher.update(_string,'utf8','hex')
		crypted += cipher.final('hex');
		return crypted;
	}
	dec(_string){
		var algorithm = 'aes-256-ctr';
		var decipher = this.crypto.createDecipher(algorithm,process.env.ENC_KEY);
		var dec = decipher.update(_string,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}

}