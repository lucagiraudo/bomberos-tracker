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
var summary_ds_days;
var summary_dj_days;
var summary_team_days;
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
    if (figma.currentPage.selection.length !== 1) {
        figma.closePlugin("select a 'project-v2' object");
        return;
    }
    summary_selected_component = figma.currentPage.selection[0];
    summary_code_textnode = summary_selected_component.findOne(n => n.name === "summary_project_code");
    summary_color_code = summary_selected_component.findOne(n => n.name === "summary_color_code").fills[0].color;

    console.log("color: " + Math.round(summary_color_code.r * 255) + " " + (summary_color_code.g * 255));


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

        if (activity_project_code)
            activity_project_code_text = activity_project_code.characters.toUpperCase();

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
        else {
            console.log("Activity skipped")
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
figma.showUI(__html__, { width: 600, height: 280 });
main();
// draw();

figma.closePlugin;
//draw  TEST
// function draw() {
//     //test to write element
//     frame.resizeWithoutConstraints(frameWidth, frameHeight)
//     // Center the frame in our current viewport so we can see it.
//     frame.x = figma.viewport.center.x - frameWidth / 2
//     frame.y = figma.viewport.center.y - frameHeight / 2
//     for (var i = 0; i < total_days; i++) {
//         // The activity
//         const activity = figma.createRectangle();
//         frame.appendChild(activity);
//         activity.x = 20;
//         activity.y = posY;
//         activity.resizeWithoutConstraints(activityWidth, activityHeigth)
//         activity.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
//         activity.strokes = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
//         activity.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }
//         const label = figma.createText()
//         frame.appendChild(label)
//         label.x = 25
//         label.y = posY + 10
//         label.resizeWithoutConstraints(right - left + 100, 50)
//         label.fills = [{ type: 'SOLID', color: {r: 0, g: 0, b: 0} }]
//         label.characters = summary_code_textnode.characters.toUpperCase();
//         label.fontSize = 30
//         label.textAlignHorizontal = 'CENTER'
//         label.textAlignVertical = 'BOTTOM'
//         label.constraints = {horizontal: 'STRETCH', vertical: 'STRETCH'}
//         posY += 50;
//     }
// }
