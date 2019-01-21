var calendar = function(_containerDiv, _monthOfYear = false){

    let monthStr = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    let dayStr = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    
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
    for(var i = 0; i < 6; i++){ // create six rows per month
        if(endOfMonthReached) break; // no work if no more days to add
        var thisRow = document.createElement("tr");
        thisRow.className = "calweek week_"+String(i);

        for(var x = 0; x < 7; x++){ // create seven days per week
            // if dates not yet started, and day reached, start counting
            if( !dateCounterStarted && x===startDay ){
                dateCounterStarted = true;
            }
            if(dateCounterStarted && dateCounter<=daysInMonth-1){
                dateCounter++;
                var cellString = "<p>" + dayStr[x] + "</p>";
                cellString+= "<p>" + String(dateCounter) + "</p>";
            }else{
                var cellString = "";
            }

            var thisDay = document.createElement("td");
            thisDay.className = "calday day_"+String(x);
            if(dateCounterStarted && !endOfMonthReached){
                thisDay.className = "calday day_"+String(x);
                thisDay.dataset["monthdate"] = dateCounter;
                thisDay.innerHTML = cellString;
                // add click event
                thisDay.addEventListener("click",(_e)=>{
                    _e.stopPropagation();
                    _e.preventDefault();
                    console.log("data: ", _e.currentTarget.dataset);
                    console.log("data: ", _e.currentTarget.dataset["monthdate"]);
                    if( _e.currentTarget.style.backgroundColor!="red" ){
                        _e.currentTarget.style.backgroundColor = "red"
                    }else{
                        _e.currentTarget.style.backgroundColor = null;
                    }
                    return;
                })
            }

            thisRow.appendChild(thisDay);
            if(dateCounter > daysInMonth-1) endOfMonthReached = true; // have all days of the month been done?
        }
        this.calTable.appendChild(thisRow);
    }

    // add table to container
    this.container.appendChild(this.calTable);

}