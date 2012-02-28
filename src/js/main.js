$(document).ready(function() {

	Overlap.savedClick;
	Overlap.helper.textContent = $("#text").clone();
	Overlap.activeConcept = Overlap.bar;

	console.log(Overlap.bar);

	// Saving the state
	Overlap.atomList = [];

	var categories = [
	{
		"name":"Category 1",
		"subs":
			["subcategorie 1",
			"subcat 2",
			"subcategorie 3"]},
	{
	"name":"Category 2",
	"subs":
		["subcategorie 1",
		"subcategorie 2",
		"subcategorie 3",
		"subcategorie 4",
		"subcategorie 5" ]},
	{
	"name":"Category 3",
	"subs":
		["subcategorie 1",
		"subcategorie 2"]},
	{
	"name":"Category 4",
	"subs":
		["subcategorie 1",
		"subcategorie 2",
		"subcategorie 3",
		"subcategorie 4"]}
	];


	// load menu at the top
	Overlap.menu.loadCategoryMenu(categories);

	// load the context menu, but hide it (it becomes
	// visible when annotating the text (mouseup event)
	Overlap.menu.loadContextMenu(categories);

	$("#text").mouseup(function(event){

		Overlap.savedClick = null;
		var text = document.getSelection().toString();

		if(!text){
			Overlap.menu.hideMenu();
			return;
		}

		var selection =	$("#text").selection();

		Overlap.savedClick = {
			"start": 	selection.start,
			"end": 		selection.end
		};

		// adjust the selection (snap to whole words)
		Overlap.savedClick = Overlap.helper.getRealSelection(text);

		// show the selected text to the user
		$("#text").selection(Overlap.savedClick["start"],
			Overlap.savedClick["end"]);

		// display the context menu
		Overlap.menu.showMenu(event, categories);
	});


	$("#barViewButton").click(function(){
		Overlap.activeConcept = Overlap.bar;
	});

	$("#borderViewButton").click(function(){
		Overlap.activeConcept = Overlap.border;
	});
});