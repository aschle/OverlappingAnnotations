function resetAppAfterAnnotation(){
	// hover-effect for single words 
	$(".word_split").lettering('words');
}

function loadCategoryMenu(){
	// load the categories inside the #menu
	for(categoryId in categories){									
		var contentString = "<h5>" + categories[categoryId]["name"] + "</h5>\n<ul>\n";		
		for(subId in categories[categoryId]["subs"]){
			contentString += "<li>" + categories[categoryId]["subs"][subId] +"</li>\n";
		}
		contentString += "</ul";
		$("#c_"+categoryId).html(contentString);
	}
}

var atomList = [];

function addAtomToAtomList(category, subcategory, start, end){
			
	atomList.push({
		"start":Number(start),
		"end":Number(end),
		"category":Number(category),
		"subcategory":Number(subcategory)
		});
}

		

