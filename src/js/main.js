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
	Overlap.disabled			= false;

	Overlap.Atoms 				= new Overlap.Atoms();
	Overlap.Bar 					= new Overlap.Bar();
	Overlap.Border 				= new Overlap.Border();
	Overlap.Menu 					= new Overlap.Menu(Overlap.categories);
	Overlap.activeConcept = Overlap.Bar;

	Overlap.Storage				= new Overlap.Storage();

	$("#barViewButton").addClass("activeButton");


	// *** ALL USER INTERACTION (Clicking, Buttons, usw.)

	$("body").click(function(e){

console.log(e);
		//if(e.srcElement.nodeName != "H5"){
			Overlap.Menu.hideMenu();
		//}
	});

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
		Overlap.savedClick = Overlap.Helper.getRealSelection(text);

		// show the selected text to the user
		$("#text").selection(Overlap.savedClick["start"],
			Overlap.savedClick["end"]);

		// display the context menu
		Overlap.Menu.showMenu(event);
	});


	// Concept buttons
	$("#barViewButton").click(function(){
		$("#borderViewButton").removeClass("activeButton");
		Overlap.activeConcept.reset();
		Overlap.activeConcept = Overlap.Bar;
		Overlap.activeConcept.run();
		$(this).addClass("activeButton");
	});

	$("#borderViewButton").click(function(){
		$("#barViewButton").removeClass("activeButton");
		Overlap.activeConcept.reset();
		Overlap.activeConcept = Overlap.Border;
		Overlap.activeConcept.run();
		$(this).addClass("activeButton");
	});

	Overlap.textX = 250;
	// Does not work: $("#text").position().left;
	Overlap.textY	= $("#text").position().top;


	// SAVE and LOAD Button
	$("#saveButton").click(function(){
		$("#savePopup").fadeIn(200);
		$(".allInStorage").empty();
		$("#saveName").val("");

		Overlap.Helper.appendRadioList("radiosSave");


		$("#saveName").keyup(function(){
			if($(this).val().length > 0){
				$("input[type=radio]").attr("disabled", "disabled");
				Overlap.disabled = true;
			} else {
				$("input[type=radio]").removeAttr("disabled");
				disabled = false;
			}
		});
	});

	$("#loadButton").click(function(){
		$("#loadPopup").fadeIn(200);
		$(".allInStorage").empty();
		Overlap.Helper.appendRadioList("radiosLoad");
	});

	$("#confirmButtonSave").click(function(){
		var name = null;
		if(Overlap.disabled){
			name = $("#saveName").val();
		} else {
				name=$("input[name=radiosSave]:checked").val();
		}

		console.log(name);

		Overlap.Storage.save(name);
		$("#savePopup").fadeOut(200);
	});

	$("#cancelButtonSave").click(function(){
		$("#savePopup").fadeOut(200);
	});

	$("#confirmButtonLoad").click(function(){
		var name = $("input[name=radiosLoad]:checked").val();
		Overlap.Storage.load(name);
		Overlap.activeConcept.run();
		$("#loadPopup").fadeOut(200);
	});

	$("#cancelButtonLoad").click(function(){
		$("#loadPopup").fadeOut(200);
	});
});