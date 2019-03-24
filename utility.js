module.exports = class utility {

	constructor() {
		if (typeof crypto != "undefined") {
			this.crypto = crypto;
		} else {
			this.crypto = require('crypto');
		}
		this.key = Buffer.from(process.env.ENC_KEY, 'hex');
	}

	enc(_string) {
		var algorithm = 'aes-256-ctr';

		var iv = this.crypto.randomBytes(16);

		var cipher = this.crypto.createCipheriv(algorithm, this.key, iv);
		var crypted = cipher.update(_string, 'utf8', 'hex')
		crypted += cipher.final('hex');
		return iv.toString('hex') + crypted;
		// iv will be first 32 char
	}
	dec(_string) {
		var iv_str = _string.substring(0, 32)
		var iv_buf = Buffer.from(iv_str, 'hex');
		var encryptedString = _string.substring(32, _string.length);

		var algorithm = 'aes-256-ctr';
		var decipher = this.crypto.createDecipheriv(algorithm, this.key, iv_buf);
		var dec = decipher.update(encryptedString, 'hex', 'utf8')
		dec += decipher.final('utf8');
		return dec;
	}

	/**
	 * Quick email. Returns promise with response status and body.
	 * 
	 * The _to field can be a string containing a valid email, or an array of these.
	 * 
	 * Sendgrid api docs: https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html
	 * @description sendgrid email
	 * @param {String} _subject 
	 * @param {String|Array} _to 
	 * @param {String} _from 
	 * @param {String} _body 
	 */
	email(_subject, _to, _from, _body) {
		return new Promise((resolve, reject) => {
			if(!process.env.SENDGRID_API_KEY){
				return reject({message:"missing SENDGRID_API_KEY"});
			}
			var to = _to;
			if(typeof _to === "string"){
				to = [_to];
			}
			let https = require('https');
			let headers = {
				"Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
				"Content-Type": "application/json"
			}
			let options = {
				hostname: 'api.sendgrid.com',
				port: 443,
				path: '/v3/mail/send',
				method: 'POST',
				headers: headers
			};
			let postDataObject = {
				"personalizations":[
					{
						"to":[]
					}
				],
				"from":{
					"email": String(_from)
				},
				"subject": String(_subject),
				"content":[
					{
						"type":"text/html",
						"value": String(_body)
					}
				]
			}
			for(let i=0, l=to.length; i<l; i++){
				let thisEmail = to[i];
				postDataObject.personalizations[0].to.push( {'email': String(thisEmail)} );
			}
			var data = '';
			let req = https.request(options, (res) => {
				res.on('data', (d) => {
					data += String(d);
				});
				res.on('end', ()=>{
					if(res.statusCode===202){
						return resolve({status : res.statusCode, body : data, messageid : res.headers['x-message-id']});
					}else{
						return reject({status : res.statusCode, body : data});
					}
				})
			});
			req.on('error', (e) => {
				return reject(e);
			});
			req.write( JSON.stringify(postDataObject) );
			req.end();
		});
	}

}