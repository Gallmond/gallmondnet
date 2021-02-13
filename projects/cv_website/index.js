let baseProject = require('../baseProject.js');

class cv_website_class extends baseProject {

	constructor(_app) {
		super(_app) // in ES6 a subclass MUST call super

		console.log("========== cv_website_class constructor ==========");

		this.project_path = "projects/cv_website/";

		this.crypto = require('crypto');


	}

	set_routes() {
		this.cv_page();
	};

	cv_page() {
		this.routes["GET"]["favicon"] = {
			'description': 'kill favicon',
			'paths': ['/favicon'],
			'callback': (req, res) => {
				res.set('Content-Type', 'text/plain');
				res.status(204).send('no content');
			}
		}
		this.routes["GET"]["cv_page"] = {
			'description': 'Just displays static CV page',
			'paths': ['/cv'],
			'callback': (req, res) => {
				let now = new Date().valueOf();
				console.log(`Showing cv page at ${now}`);


				let randomToken = this.crypto.randomBytes(16).toString('hex');
				// req.session.token = randomToken;

				console.log('randomToken', randomToken);
				res.render(this.project_path + 'cv', {'token':randomToken});
			}
		}

		this.routes['POST']['contact_email_handler'] = {
			'description': 'handles contact email request',
			'paths': ['/contact_email_handler'],
			'callback': (req,res)=>{

				// if passed-in token matches session token, send
				// if( typeof req.query.token === "string" && (String(req.session.token) === String(req.query.token)) ){
					console.log('Token match, send email')

					let emailHTML = '';
					emailHTML+= '<!DOCTYPE html>\r\n';
					emailHTML+= '<html>\r\n';
						emailHTML+= '<head>\r\n';
							emailHTML+= '<meta charset="UTF-8">\r\n';
							emailHTML+= '<title>title</title>\r\n';
						emailHTML+= '</head>\r\n';
						emailHTML+= '<body> 	\r\n';
							emailHTML+= '<p>' +String(req.query.message)+ '</p>\r\n';
						emailHTML+= '</body>\r\n';
					emailHTML+= '</html>\r\n';

					Util.email('Gallmond.net contact', process.env.CONTACT_EMAIL, req.query.from, emailHTML).then((resolveObj, rejectObj)=>{
						if(rejectObj){
							console.log('error', rejectObj);
							if(rejectObj.message){
								res.set('Content-Type', 'text/plain');
								res.status(500).send( String(rejectObj.message) );
								return;
							}else{
								res.set('Content-Type', 'text/plain');
								res.status(500).send( 'unknown error' );
								return;
							}
						}
						console.log('Email sent. messageid:', resolveObj.messageid);
						res.set('Content-Type', 'text/plain');
						res.status(200).send( resolveObj.messageid );
					});

				// }else{
				// 	console.log('token mismatch');
				// 	res.set('Content-Type', 'text/plain');
				// 	res.status(500).send('token did not match');
				// }



			}
		}
	}

}
module.exports = cv_website_class;