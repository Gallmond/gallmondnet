let baseProject = require('../baseProject.js');

class cv_website_class extends baseProject{

    constructor(_app){
        super(_app) // in ES6 a subclass MUST call super

        console.log("========== cv_website_class constructor ==========");

        this.project_path = "projects/cv_website/";
       

    }

    set_routes(){
        this.cv_page();
    };

    cv_page(){
        this.routes["GET"]["cv_page"] = {
            'description':'Just displays static CV page',
            'paths':['/cv'],
            'callback':(req,res)=>{
               res.render(this.project_path + 'cv');
            }
        }
    }

}
module.exports = cv_website_class;