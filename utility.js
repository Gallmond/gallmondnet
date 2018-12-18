module.exports = class utility{
	
	constructor(){
		if(typeof crypto != "undefined"){
			this.crypto = crypto;
		}else{
			this.crypto = require('crypto');
		}
		this.key = Buffer.from(process.env.ENC_KEY, 'hex');
	}

	enc(_string){
		var algorithm = 'aes-256-ctr';

		var iv = this.crypto.randomBytes(16);

		var cipher = this.crypto.createCipheriv(algorithm,this.key, iv);
		var crypted = cipher.update(_string,'utf8','hex')
		crypted += cipher.final('hex');
		return iv.toString('hex')  + crypted;
		// iv will be first 32 char
	}
	dec(_string){
		var iv_str = _string.substring(0,32)
		var iv_buf = Buffer.from(iv_str, 'hex');
		var encryptedString = _string.substring(32,_string.length);

		var algorithm = 'aes-256-ctr';
		var decipher = this.crypto.createDecipheriv(algorithm,this.key, iv_buf);
		var dec = decipher.update(encryptedString,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}

}