$(document).ready(function() {

	Overlap.categories = [{
	  "name": "Category 1",
	  "subs": ["subcategorie 1", "subcat 2", "subcategorie 3"]
	}, {
	  "name": "Category 2",
	  "subs": ["subcategorie 1", "subcategorie 2", "subcategorie 3",
	  "subcategorie 4", "subcategorie 5"]
	}, {
	  "name": "Category 3",
	  "subs": ["subcategorie 1", "subcategorie 2"]
	}, {
	  "name": "Category 4",
	  "subs": ["subcategorie 1", "subcategorie 2", "subcategorie 3",
	  "subcategorie 4"]
	}];

	Overlap.savedClick		= null;
	Overlap.textContent		= $("#text").clone();
	Overlap.activeConcept = Overlap.bar;
	Overlap.Menu 					= new Overlap.Menu(Overlap.categories);

	// *** ALL USER INTERACTION (Clicking, Buttons, usw.)

	// Show the context menu if text was selected
	$("#text").mouseup(function(event){

		Overlap.savedClick = null;
		var text = document.getSelection().toString();

		if(!text){
			Overlap.Menu.hideMenu();
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
		Overlap.Menu.showMenu(event);
	});


	// Concept buttons
	$("#barViewButton").click(function(){
		Overlap.activeConcept = Overlap.Bar;
	});

	$("#borderViewButton").click(function(){
		Overlap.activeConcept = Overlap.Border;
	});
});