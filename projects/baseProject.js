class baseProject{

    constructor(_app){
        this.project_name = "baseProject";
        this.project_path = "projects/";
        this.app = _app;
        this.routes = {"GET":{}, "POST":{}};
        /* set routes like:
        this.routes["GET"]["route_name"] = {
            'description': 'some simple description, just for launch output',
            'paths':['/paths','/go/:here'],
            'callback':(req,res)=>{
                // some logic
               res.render(this.project_path + 'viewname');
            }
        }
        */
        this.set_routes();
        this.route_loader();
        return this;
    }

    set_routes(){
        // put functions here that set routes in the route objects
    }

    route_loader(){
        for(var verb in this.routes){
            for(var path_name in this.routes[ verb ]){
                console.log("attempting to load:", path_name, verb, this.routes[ verb ][ path_name ].paths);
                if( this.routes[ verb ][ path_name ].description ){
                    console.log( "(" + String(this.routes[ verb ][ path_name ].description) + ")" );
                }
                if(verb.toUpperCase() === "GET"){
                    this.app.get( this.routes[ verb ][ path_name ].paths, this.routes[ verb ][ path_name ].callback);
                }else if(verb.toUpperCase() === "POST"){
                    this.app.post( this.routes[ verb ][ path_name ].paths, this.routes[ verb ][ path_name ].callback);
                }else if(verb.toUpperCase() === "ALL"){
                    this.app.all( this.routes[ verb ][ path_name ].paths, this.routes[ verb ][ path_name ].callback);
                }
            }
        }
    };

}
module.exports = baseProject;