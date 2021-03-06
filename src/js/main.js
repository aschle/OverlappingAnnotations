$(document).ready(function() {

	// Overlap.categories = [{
	//   "name": "Allgemein",
	//   "subs": ["Basic"]
	// }, {
	//   "name": "Geschichte",
	//   "subs": ["Basic", "Advanced"]
	// }, {
	//   "name": "Architektur",
	//   "subs": ["Basic", "Advanced"]
	// }, {
	//   "name": "Ausstellungen",
	//   "subs": ["Basic", "Advanced"]
	// }];

	Overlap.categories = [{
	  "name": "Architektur",
	  "subs": ["Überblick", "Detail", "Stilrichtung", "Gebäude", "Gebäudeteil", "Material"]
	}, {
	  "name": "Geschichte",
	  "subs": ["Überblick", "Detail", "Eröffnung", "politisches Ereignis"]
	}, {
	  "name": "Geographie",
	  "subs": ["Überblick", "Detail", "Kontinent", "Land", "Standort", "Stadt", "Fluss"]
	}, {
	  "name": "Personendaten",
	  "subs": ["Überblick", "Detail", "Name", "Vorname", "Nachname", "Beruf"]
	}];

	// Overlap.categories = [{
	//   "name": "Geografie",
	//   "subs": ["Kontinent", "Land", "Ort", "Stadt", "Fluss"]
	// }, {
	//   "name": "Personendaten",
	//   "subs": ["Name", "Vorname", "Nachname", "Beruf"]
	// }, {
	//   "name": "Architektur",
	//   "subs": ["Epoche", "Stilrichtung", "Gebäude", "Gebäudeteil", "Material"]
	// }, {
	//   "name": "Ereignis",
	//   "subs": ["Eröffnung", "Gründung", "kulturelles Ereignis", "politisches Ereignis"]
	// }];

	Overlap.savedClick		= null;
	Overlap.textContent		= $("#text").clone();
	Overlap.disabled			= false;

	Overlap.Atoms 				= new Overlap.Atoms();
	Overlap.Bar 					= new Overlap.Bar();
	Overlap.Border 				= new Overlap.Border();
	Overlap.Menu 					= new Overlap.Menu(Overlap.categories);
	Overlap.Menu.loadMenuShort();
	Overlap.activeConcept = Overlap.Bar;

	Overlap.Storage				= new Overlap.Storage();

	$("#barViewButton").addClass("activeButton");


	// *** ALL USER INTERACTION (Clicking, Buttons, usw.)

	$('body').mousemove(function(){
		if (Overlap.Menu.visible){
			Overlap.Menu.hideSubMenu();
		}
	});

	$("body").click(function(e){
		Overlap.Menu.hideMenu();
	});

	// disable contextMenu on rightClick
	document.oncontextmenu = function() {return false;};

	// just to make the bubbles HOVERBAR, and text is still selectable
	$("#text").mousedown(function(){
		$(".bubble").css("z-index", -2);
	});

	$(".bubble").live("mousedown", function(){
		$(".bubble").css("z-index", -2);
	});

	// Show the context menu if text was selected
	$("#text").mouseup(function(event){

		Overlap.savedClick = null;
		var text = document.getSelection().toString();

		if(!text){
			Overlap.Menu.hideMenu();
			Overlap.activeConcept.run();
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
		console.log(Overlap.savedClick);

		if(Overlap.savedClick["end"] < Overlap.savedClick["start"]){
			Overlap.Menu.hideMenu();
			Overlap.activeConcept.run();
			return;
		}

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