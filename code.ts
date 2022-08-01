// README

// Summary = one component per page located at the top of the time tracker File

// Activity = component used to allocate time in the timeline.

// 2 kind of activity component (switch as variant):
// - 4 hours (Full day OFF)
// - 8 hours (Full day ON)

// We refer to the summary component elements as summary_***

// We refer to the Activity component elements as activity_***

// ------- GENERAL ------- //
let selected_component: any;
let code_textnode;
var color_code;
var project_type;

// team or person switch
var calc_mode = "team";

// ------- SUMMARY ------- //
var summary_array;
var summary_project_code;

//to calculate total days for the project
var booked_days;


// ------- ACTIVITY ------- //
var totalhour_counter = 0;
var used_day_counter = 0;
var activity_array;
var activity_project_code: any;
var activity_skipped = 0;
var activity_project_code_text;
var activity_person;




// Figma file to refer to for components:
// https://www.figma.com/community/file/969639692881611105/Planner---Bomberos





// ------- FUNCTIONS ------- //

figma.on('selectionchange', () => {

    if(figma.currentPage.selection[0]){
        if(updateSelectedElementInfos()){
            figma.ui.postMessage({
                loaderStatus: {
                    status: 1,
                }
            });
            
            calculate();
        }
    }else{
        figma.notify('Seleziona un blocco "Activity" o "Project-Summary"', {timeout: 900} );
    }
});
  


// ------- PROGRAM ------- //

figma.showUI(__html__, { width: 280, height: 400 });

figma.ui.onmessage = (message) => {

    if(message == "calculate"){
        calculate();
    }else if(message == "team" || message == "person" ){
        calc_mode = message;
        calculate();
    }
}

selected_component = figma.currentPage.selection[0]

if(selected_component.name === "activity-v2" || selected_component.name === "project-summary-v2"){
    updateSelectedElementInfos();
    calculate();
}



figma.closePlugin



function updateSelectedElementInfos(){
        selected_component = figma.currentPage.selection[0]
    

        if(selected_component.name === "activity-v2" || selected_component.name === "project-summary-v2"){

        //collect infos about the project
        project_type = selected_component.componentProperties["project"].value
        code_textnode = selected_component.findOne(n => n.name === "project_code");
        color_code = selected_component.findOne(n => n.name === "project_color_code").fills[0].color;

        console.log("selected project type: " + project_type)

        //initials only with activity component
        if(selected_component.name === "activity-v2"){
            activity_person = selected_component.findOne(n => n.name === "initials").characters;

            //send to UI
            figma.ui.postMessage({
                projectInfos: {
                    from: "activity",
                    project_name: code_textnode.characters.toUpperCase(),
                    project_type: project_type,
                    project_color_red: Math.round(color_code.r * 255),
                    project_color_green: Math.round(color_code.g * 255),
                    project_color_blue: Math.round(color_code.b * 255),
                    activity_person: activity_person
                }
            });
        //booked days only with summary component
        }else if(selected_component.name === "project-summary-v2"){
            booked_days = selected_component.findOne(n => n.name === "summary_booked_days").characters;
            
            //send to UI
            figma.ui.postMessage({
                projectInfos: {
                    from: "summary",
                    project_name: code_textnode.characters,
                    project_type: project_type,
                    project_color_red: Math.round(color_code.r * 255),
                    project_color_green: Math.round(color_code.g * 255),
                    project_color_blue: Math.round(color_code.b * 255),
                    booked_days: booked_days
                }
            });
        }

        return true
    }
    else{
        return false
    }
}


function calculate() {
    //reset all
    totalhour_counter = 0;
    used_day_counter = 0;
    activity_skipped = 0;
    booked_days = 0;

    //search for all activity with selected project code
    activity_array = figma.currentPage.findAll(n => n.name === "activity-v2");

    console.log("activity items number: " + activity_array.length);
    


    var persons_days_array = [];

    var temp_person = [];
    
    activity_array.forEach((activity: any) => {
        // console.log("current activity: " + activity);

        activity_project_code = activity.findOne(n => n.name === "project_code");

        if(activity_project_code){
            var activity_project_code_text = activity_project_code.characters.toUpperCase();


                // //calculate total days
                if (activity_project_code_text === code_textnode.characters.toUpperCase()) {

                    if(calc_mode == "team"){
                        totalhour_counter += +activity.componentProperties["hours"].value
                    }else{
                        // only if same initials
                        console.log("person mode")
                        if(activity.findOne(n => n.name === "initials").characters === activity_person){
                            totalhour_counter += +activity.componentProperties["hours"].value
                        }

                    }


                    //test per calcolare tutte le ore di tutti i partecipanti
                    var current_activity_initials = activity.findOne(n => n.name === "initials").characters;
                    var current_activity_days = activity.componentProperties["hours"].value/8;
                    var in_array = false;

                    if(persons_days_array[0]){
                        persons_days_array.forEach((person: any, index) => {
                            if(person[0] == current_activity_initials){
                                persons_days_array[index][1] += +current_activity_days
                                in_array = true;
                            }
                        });
                    }

                    //if not present in array or first round, add the person
                    if(!in_array){
                        temp_person = [current_activity_initials, +current_activity_days];
                        persons_days_array.push(temp_person);
                    }

                    console.log(persons_days_array);
                    
                }



        }
    });

    used_day_counter = totalhour_counter / 8;


    // COUNT BOOKED DAYS
    summary_array = figma.currentPage.findAll(n => n.name === "project-summary-v2");
    summary_array.forEach((summary: any) => {
        summary_project_code = summary.findOne(n => n.name === "project_code").characters.toUpperCase();
        // console.log("code: " + summary_project_code);

        if(summary_project_code === code_textnode.characters.toUpperCase()){
            booked_days = summary.findOne(n => n.name === "summary_booked_days").characters;
        }
    });


    //SENDING TO UI
    figma.ui.postMessage({
        daysCount: {
            from: project_type,
            booked_days: booked_days,
            used_day_counter: used_day_counter,
            persons_days_array: persons_days_array,
        }
    });


    

}