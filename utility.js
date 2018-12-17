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

		var iv = this.crypto.randomBytes(16);

		console.log("iv", iv);

		console.log("iv.toString()", iv.toString('utf8'));

		var cipher = this.crypto.createCipheriv(algorithm,process.env.ENC_KEY, iv);
		var crypted = cipher.update(_string,'utf8','hex')
		crypted += cipher.final('hex');
		return iv + ":" + crypted;
	}
	dec(_string){
		if(_string.indexOf(":")==-1){ return false; }
		var iv = _string.split(":")[0];
		var encryptedString = _string.split(":")[1];

		var algorithm = 'aes-256-ctr';
		var decipher = this.crypto.createDecipheriv(algorithm,process.env.ENC_KEY, iv);
		var dec = decipher.update(encryptedString,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}

}

