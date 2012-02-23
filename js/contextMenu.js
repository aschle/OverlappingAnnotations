/* Loads the contextMenu, depending on the categories array.*/
function loadContextMenu(categories){
	
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
}

var lastSubMenuId;

function effectsOnMenu(){
	
	var menu = $("#contextMenu");
	
	// mouseover -> display subMenus
	menu.children().each(function(index){
		$(this).mouseover(function(){
			
			$("#subContextMenu_" + lastSubMenuId).css("display", "none");
			$("#subContextMenu_" + index).css("display", "");
			lastSubMenuId = index;
		});
	});
	
	// when mouse leaves the submenu, hide it
	$("div[id^='subContextMenu_']").mouseleave(function(){
			$(this).css("display", "none");
	});
	
	// click on submenu entry
	$("div[id^='subContextMenu_']").children().each(function(){
		$(this).click(function(){
			
			$(this).parent().css("display", "none");
			menu.css("display", "none");
			
			// get rid of the single-word hovering
			$("#text").html(textContent.html());
						
			var idArray = $(this).attr("id").split("_");
			addAtomToAtomList(idArray[1], idArray[2], savedClick["start"], savedClick["end"]);
			
			// render all bars again and display them: bars.js
			savedClick = null;
			reset();
			render();
			display();
			
			resetAppAfterAnnotation();
		});
	});	
}

function showMenu(e, endElement){
		
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

function hideMenu(){
}
