var calendar = function(_containerDiv, _monthOfYear = false){

    console.log("\r\n===== CREATING CALENDAR =====");

    let monthStr = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    let dayStr = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    this.allDayElements = [];
    this.myLastAvailabilityDays = [];

    this.addSubmitButton = ( _buttonElement )=>{
        _buttonElement.addEventListener("click",(_e)=>{
            _e.stopPropagation();
            _e.preventDefault();
            // get dates
            var availableDates = [];
            for(let x = 0, l = this.allDayElements.length; x < l; x++){
                if( this.allDayElements[x].dataset["selected"] === "true" ){
                    availableDates.push( this.allDayElements[x].dataset["yyyymmdd"] );
                }
            }
            // check there's a change
            var noChange = true;            
            // if new and old are different length they must have changed
            if( availableDates.length != this.myLastAvailabilityDays.length ){ 
                noChange = false;
            }
            // if new contains elements not in old it must have changed
            for(let x = 0, l = availableDates.length; x < l; x++){
                var indexInOld = this.myLastAvailabilityDays.indexOf( availableDates[x] );
                if(indexInOld == -1){
                    noChange = false;
                }
            }
            // die if no change
            if(noChange){
                console.log("no change", this.myLastAvailabilityDays, availableDates);
                _buttonElement.innerHTML = "No change detected";
                setTimeout(() => {
                    _buttonElement.innerHTML = "Submit days";
                }, 1000);
                return false;
            }
            // submit dates to back end
            this.datesBeforeSubmission = this.myLastAvailabilityDays;
            this.newDatesBeingSubmitted = availableDates;
            var url = "/fwf_ajax/submit_available_days";
            var jsonParams = {
                "availableDates": availableDates
            };
            var jsonString = JSON.stringify(jsonParams);
            var xhttp;
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = (
                function(_xhttp, _thisCal, _buttonElement){
                    return function() { // this is a closure, allowing us to pass in the xhttp and 'this' calendar
                        if(_xhttp.readyState == 0){ // UNSENT 	Client has been created. open() not called yet.
                        }else if(_xhttp.readyState == 1){ // OPENED 	open() has been called. 
                            _buttonElement.innerHTML = "sending to back end...";
                        }else if(_xhttp.readyState == 2){ // HEADERS_RECEIVED 	send() has been called, and headers and status are available.
                        }else if(_xhttp.readyState == 3){ // LOADING 	Downloading; responseText holds partial data.
                        }else if(_xhttp.readyState == 4){ // DONE 	The operation is complete
                            console.log("_xhttp done", _xhttp);
                        }
                        if (_xhttp.readyState == 4 && _xhttp.status == 200) {
                            _thisCal.myLastAvailabilityDays = _thisCal.newDatesBeingSubmitted;
                            setTimeout(() => { 
                                _buttonElement.innerHTML = "updated!";
                            }, 1000);
                            setTimeout(() => { 
                                _buttonElement.innerHTML = "Submit dates";
                            }, 2000);
                        }
                    }
                }   
            )(xhttp, this, _buttonElement);
            xhttp.open("POST", url, true);
            xhttp.withCredentials = true; // this sends cookies now
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send( jsonString );
            // ajax end            

        });

    }

    this.loadMyAvailableDays = (_dayArray)=>{
        this.myLastAvailabilityDays = _dayArray;
        for(let x = 0, l = this.allDayElements.length; x < l; x++){
            var thisYYYYMMDD = this.allDayElements[x].dataset["yyyymmdd"];
            var dayIndex = _dayArray.indexOf( thisYYYYMMDD );
            if(dayIndex != -1){
                markSelected( this.allDayElements[x] );
            }
        }
    }

    this.loadFriendsAvailableDays = (_friendAvailabilityObject)=>{
        console.log("this.loadFriendsAvailableDays", _friendAvailabilityObject);

        for(friendName in _friendAvailabilityObject){

            for(let x = 0, l = this.allDayElements.length; x < l; x++){
                var thisYYYYMMDD = this.allDayElements[x].dataset["yyyymmdd"];
            
                if( _friendAvailabilityObject[friendName].indexOf( thisYYYYMMDD ) != -1 ){
                    addFriendToDay(this.allDayElements[x], friendName);
                }
            
            }

        }

    }

    var addFriendToDay = (_dayElement, _friendName)=>{
        // ==== style friend block here ====
        var friendElement = document.createElement('span');
        friendElement.innerHTML = String(_friendName) + "<br>";
        friendElement.style.backgroundColor = "green";
        // friendElement.style.display = "inline-block";
        friendElement.style.border = "1px solid black";
        // ==== style friend block here ====
        var thisDayChildren = _dayElement.children;
        for(index in thisDayChildren){
            if( thisDayChildren[index].className === "friends" ){
                thisDayChildren[index].appendChild( friendElement );
            }
        }
    }

    var markSelected = (_element)=>{
        if( _element.style.backgroundColor!="red" ){
            _element.style.backgroundColor = "red"
            _element.dataset["selected"] = "true";
        }else{
            _element.style.backgroundColor = null;
            _element.dataset["selected"] = "false";
        }
        return;
    }

    // ==== initilisation stuff beyond ====

    // get actual month
    var d = new Date();
    var thisYear = d.getFullYear();
    if(!_monthOfYear){
        var thisMonth = d.getMonth();
    }else{
        var thisMonth = _monthOfYear;
    } 

    // get fresh month
    var nd = new Date();
    nd.setFullYear( thisYear ); 
    nd.setMonth( thisMonth );
    nd.setDate(1); nd.setHours(0); nd.setMinutes(0); nd.setSeconds(0); nd.setMilliseconds(0);
    console.log("reset date:", nd);

    this.yyyy = String(nd.getFullYear());
    this.mm = nd.getMonth()+1;
    this.mm = (this.mm<10?"0":"") + String(this.mm);

    // What day of the week does this month start on (0-6) (sun-mon)
    var startDay = nd.getDay(); // 0-6
    console.log("start yyyy["+String(thisYear)+"] mm["+String(thisMonth)+"] is day: ", startDay);

    // How many does does this month have in it (actual num)
    var daysInMonth = new Date(thisYear, thisMonth+1, 0).getDate();
    console.log("days in yyyy["+String(thisYear)+"] mm["+String(thisMonth)+"]:", daysInMonth);

    // set containing div
    this.container = document.getElementById(_containerDiv);
    // create table
    this.calTable = document.createElement("table");
    // create label with month name
    let header = document.createElement("th");
    header.colSpan = 7;
    header.innerHTML = monthStr[thisMonth];
    this.calTable.appendChild( document.createElement("tr").appendChild(header) )
    
    var dateCounter = 0;
    var dateCounterStarted = false;
    var endOfMonthReached = false;
    for(let i = 0; i < 6; i++){ // create six rows per month
        if(endOfMonthReached) break; // no work if no more days to add
        var thisRow = document.createElement("tr");
        thisRow.className = "calweek week_"+String(i);

        for(let x = 0; x < 7; x++){ // create seven days per week
            // if dates not yet started, and day reached, start counting
            if( !dateCounterStarted && x===startDay ){
                dateCounterStarted = true;
            }
            if(dateCounterStarted && dateCounter<=daysInMonth-1){
                dateCounter++;
                var cellString = "<p>" + dayStr[x] + "</p>";
                cellString+= "<p>" + String(dateCounter) + "</p>";
                cellString+= "<span class=\"friends\"></span>";
            }else{
                var cellString = "";
            }

            var thisDay = document.createElement("td");
            thisDay.className = "calday day_"+String(x);
            if(dateCounterStarted && !endOfMonthReached){
                thisDay.className = "calday day_"+String(x);
                thisDay.dataset["monthdate"] = dateCounter;
                thisDay.dataset["selected"] = "false";
                thisDay.dataset["yyyymmdd"] = this.yyyy + this.mm + (dateCounter<10?"0":"") + String(dateCounter);
                thisDay.innerHTML = cellString;
                // add click event
                thisDay.addEventListener("click",(_e)=>{
                    _e.stopPropagation();
                    _e.preventDefault();
                    var thisElement = _e.currentTarget;
                    markSelected(thisElement);
                })
                this.allDayElements.push(thisDay);
            }
            
            thisRow.appendChild(thisDay);
            if(dateCounter > daysInMonth-1) endOfMonthReached = true; // have all days of the month been done?
        }
        this.calTable.appendChild(thisRow);
    }

    // add table to container
    this.container.appendChild(this.calTable);

}