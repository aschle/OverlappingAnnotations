var Overlap = window.Overlap = Overlap || {};
Overlap.menu = {};

Overlap.menu.lastSubMenuId;
Overlap.menu.isActive = false;

/* Loads the category menu. */
Overlap.menu.loadCategoryMenu = function(categories){

	// load the categories inside the #menu
	for(categoryId in categories){
		var contentString = "<h5>" + categories[categoryId]["name"] + "</h5>\n<ul>\n";
		for(subId in categories[categoryId]["subs"]) {
			contentString += "<li>" + categories[categoryId]["subs"][subId] +"</li>\n";
		}
		contentString += "</ul";
		$("#c_"+categoryId).html(contentString);
	}
}

/* Loads the context menu.*/
Overlap.menu.loadContextMenu = function(categories){

	$("body").append("<div id='contextMenu' class='popup'></div>");
	var menu = $("#contextMenu");
	menu.css("display", "none");

	var categoryId;
	for(categoryId in categories){

		var categorieName = categories[categoryId]["name"];
		menu.append("<div id='entry_" + categoryId + "'><h5>" + categorieName + "</h5></div>");
		$("#entry_" + categoryId).addClass("hover_" + categoryId);

		$("body").append("<div id='subContextMenu_" + categoryId + "' class='popup'></div>");
		var subMenu = $("#subContextMenu_"+ categoryId);

		var subId;
		for(subId in categories[categoryId]["subs"]){

			var subCategorieName = categories[categoryId]["subs"][subId];
			subMenu.append("<div id='entry_" + categoryId + "_" + subId +"' style='cursor:pointer;'><h5>" + subCategorieName + "</h5></div>");
			subMenu.css("display", "none");
			$("#entry_" + categoryId + "_" + subId).addClass("hover_" + categoryId);
		}
		$("#entry_" + categoryId + "_" + subId).addClass("last");
	}
	$("#entry_" + categoryId).addClass("last");

	/* add effects to the menu*/
	Overlap.menu.effectsOnMenu();
}

/* */
Overlap.menu.effectsOnMenu = function(){

	var menu = $("#contextMenu");

	// mouseover -> display subMenus
	menu.children().each(function(index){
		$(this).mouseover(function(){

			$("#subContextMenu_" + Overlap.menu.lastSubMenuId).css("display", "none");
			$("#subContextMenu_" + index).css("display", "");
			Overlap.menu.lastSubMenuId = index;
		});
	});

	// when mouse leaves the submenu, hide it
	$("div[id^='subContextMenu_']").mouseleave(function(){
			$(this).css("display", "none");
	});

	// when mouse leaves the menu, hide the submenus
	menu.mouseleave(function(event){
		if(event.srcElement.id == "contextMenu" ){
			$("#subContextMenu_" + Overlap.menu.lastSubMenuId).css("display", "none");
		}
	});

	// click on submenu entry
	$("div[id^='subContextMenu_']").children().each(function(){
		$(this).click(function(){

			$(this).parent().css("display", "none");
			menu.css("display", "none");

			var idArray = $(this).attr("id").split("_");

			Overlap.helper.addAtomToAtomList(
				idArray[1],
				idArray[2],
				Overlap.savedClick["start"],
				Overlap.savedClick["end"],
				Overlap.atomList.length);

			Overlap.activeConcept.reset();
			Overlap.activeConcept.render();
			Overlap.activeConcept.display();

		});
	});
}

Overlap.menu.showMenu = function(e, categories){

	Overlap.menu.isActive = true;

	var x = e.pageX;
	var y = e.pageY + 10;

	$("#contextMenu").css("display", "");
	$("#contextMenu").css({"top": y + 4, "left":x});

	var subX = $("#contextMenu").outerWidth()-3;

	for (categoryId in categories){
		var entry = $("#entry_"+ categoryId);
		var subY = entry.position().top;
		$("#subContextMenu_"+categoryId).css({"top": y+4+subY, "left": x + subX});
	}
}

Overlap.menu.hideMenu = function(){
	$("#contextMenu").css("display", "none");
}