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

// ------- SUMMARY ------- //
var summary_array;
var summary_project_code;

//to calculate total days for the project
var total_days;


// ------- ACTIVITY ------- //
var activity_totalhour_counter = 0;
var activity_totalday_counter = 0;
var activity_array;
var activity_project_code: any;
var activity_skipped = 0;
var activity_project_code_text;




// Figma file to refer to for components:
// https://www.figma.com/community/file/969639692881611105/Planner---Bomberos





// ------- FUNCTIONS ------- //

// -- MAIN -- //
function calculate() {
    //reset all
    total_days = 0;
    activity_totalhour_counter = 0;
    
    activity_skipped = 0;

    //calculate starts
    if (figma.currentPage.selection.length !== 1) {
        figma.closePlugin("select a 'project-summary' component");
        return
    }

    selected_component = figma.currentPage.selection[0];

    project_type = selected_component.componentProperties["progetto"].value

    code_textnode = selected_component.findOne(n => n.name === "summary_project_code");

    if (!code_textnode) {

        //check if user has selected an "activity" component
        code_textnode = selected_component.findOne(n => n.name === "activity_project_code");
        console.log("activity: " + code_textnode.characters.toUpperCase());

        if (!code_textnode) {
            figma.closePlugin("select a 'project-summary' or 'activity' component");
            return;
        }
    }

    color_code = selected_component.findOne(n => n.name === "project_color_code").fills[0].color;

    console.log("color_code: " + Math.round(color_code.g * 255));

    if (code_textnode.type !== 'TEXT') {
        figma.closePlugin("nodo non riconosciuto (in realtà da fare bene questa gestione di errori)")
        return
    }


    //search for all activity with selected project code
    activity_array = figma.currentPage.findAll(n => n.name === "activity_v2");


    console.log("activity items number: " + activity_array.length);


    activity_array.forEach((activity: any) => {

        activity_project_code = activity.findOne(n => n.name === "activity_project_code");

        if(activity_project_code){
            var activity_project_code_text = activity_project_code.characters.toUpperCase();

            // //calculate total days
            if (activity_project_code_text === code_textnode.characters.toUpperCase()) {
                activity_totalhour_counter += +activity.componentProperties["ore"].value
            }
        }
    });

    activity_totalday_counter = activity_totalhour_counter / 8;
    console.log("hours: " + activity_totalhour_counter);


    total_days = selected_component.findOne(n => n.name === "summary_total_days")
    
    if(total_days){
        //summary_case
        total_days = total_days.characters;
    }else{
        //activity case, we need to find the summary
        summary_array = figma.currentPage.findAll(n => n.name === "project-summary");

        summary_array.forEach((summary: any) => {
            summary_project_code = summary.findOne(n => n.name === "summary_project_code").characters;
            
            if(summary_project_code === code_textnode.characters.toUpperCase()){
                total_days = summary.findOne(n => n.name === "summary_total_days").characters;
            }
        });
    }


    var days_todo = total_days - activity_totalday_counter;

    //send to UI
    figma.ui.postMessage({
        projectMessage: {
            project_name: code_textnode.characters,
            booked_days: total_days,
            proj_number: activity_totalday_counter,
            project_type: project_type,
            activity_skipped: activity_skipped,
            project_color_red: Math.round(color_code.r * 255),
            project_color_green: Math.round(color_code.g * 255),
            project_color_blue: Math.round(color_code.b * 255)
        }
    });
}

function calculate_by_summary(){

}

// ------- PROGRAM ------- //

figma.showUI(__html__, { width: 280, height: 400 });

figma.ui.onmessage = (message) => {
    if(message == "calculate"){
        calculate();
    }
}

figma.closePlugin




