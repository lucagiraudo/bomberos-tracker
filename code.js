// README
// Summary = one component per page located at the top of the time tracker File
// Activity = component used to allocate time in the timeline.
// 2 kind of activity component (switch as variant):
// - 4 hours (Full day OFF)
// - 8 hours (Full day ON)
// We refer to the summary component elements as summary_***
// We refer to the Activity component elements as activity_***
// ------- SUMMARY ------- //
let summary_selected_component;
let summary_code_textnode;
//to calculate total days for the project
var total_days;
var summary_color_code;
// ------- ACTIVITY ------- //
var activity_totalday_counter = 0;
var activity_array;
var activity_project_code;
var activity_skipped = 0;
var activity_project_code_text;
//---- DRAW ---- //
// const frameWidth = 400
// const frameHeight = 200
// const chartX = 25
// const chartY = 50
// const chartWidth = frameWidth - 50
// const chartHeight = frameHeight - 50
// const frame = figma.createFrame()
// var posY = 0;
// var activityWidth = 200;
// var activityHeigth = 25;
// ------- FUNCTIONS ------- //
// -- MAIN -- //
function main() {
    //reset all
    total_days = 0;
    activity_totalday_counter = 0;
    activity_skipped = 0;
    //calculate starts
    if (figma.currentPage.selection.length !== 1) {
        figma.closePlugin("select a 'project-summary' component");
        return;
    }
    summary_selected_component = figma.currentPage.selection[0];
    summary_code_textnode = summary_selected_component.findOne(n => n.name === "summary_project_code");
    if (!summary_code_textnode) {
        figma.closePlugin("please select a 'project-summary' component");
        return;
    }
    summary_color_code = summary_selected_component.findOne(n => n.name === "summary_color_code").fills[0].color;
    if (summary_code_textnode.type !== 'TEXT') {
        figma.closePlugin("nodo non riconosciuto (in realtà da fare bene questa gestione di errori)");
        return;
    }
    //search for all activity with selected project code
    activity_array = figma.currentPage.findAll(n => n.name === "activity");
    console.log("activity items number: " + activity_array.length);
    //TODO: Gestire la presenza del componente come variant che ha lo stesso nome o comunque mettere in array solo quelli giusti
    activity_array.forEach((activity) => {
        activity_project_code = activity.findOne(n => n.name === "activity_project_code");
        var activity_project_code_text = activity_project_code.characters.toUpperCase();
        // //calculate total days
        if (activity_project_code_text === summary_code_textnode.characters.toUpperCase()) {
            if (activity.height == 25) {
                activity_totalday_counter += .5;
            }
            else if (activity.height == 50) {
                activity_totalday_counter += 1;
            }
            else {
                activity_skipped++;
            }
        }
    });
    total_days = summary_selected_component.findOne(n => n.name === "summary_total_days").characters;
    var days_todo = total_days - activity_totalday_counter;
    //send to UI
    figma.ui.postMessage({
        projectMessage: {
            project_name: summary_code_textnode.characters,
            booked_days: total_days,
            proj_number: activity_totalday_counter,
            days_todo: days_todo,
            activity_skipped: activity_skipped,
            project_color_red: Math.round(summary_color_code.r * 255),
            project_color_green: Math.round(summary_color_code.g * 255),
            project_color_blue: Math.round(summary_color_code.b * 255)
        }
    });
}
// ------- PROGRAM ------- //
figma.showUI(__html__, { width: 600, height: 300 });
main();
figma.ui.onmessage = (message) => {
    if (message == "calculate") {
        main();
    }
};
figma.closePlugin;
