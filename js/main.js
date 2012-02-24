function resetAppAfterAnnotation(){
	// hover-effect for single words 
	$(".word_split").lettering('words');
}

var textContent;
function plainText(){
	$("#text").html(textContent.html());
}

/* Gets the real selection (start, end), by comparing the user selection and 
the span wrapped text. It calculates the start and end offset.*/
function getRealSelection(text){

	plainText();
	$("#text").selection(savedClick["start"], savedClick["end"]);

	var spans = $("#text").wrapSelection();

	var spanText = "";

	spans.each(function(){
		spanText += $(this).text();
		spanText += "\n\n";
	});

	var startOffset = spanText.indexOf(text);
	var endOffset = spanText.length - startOffset - text.length - 2;
	
	return {"start": savedClick["start"] - startOffset, "end": savedClick["end"] + endOffset};
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

function addAtomToAtomList(category, subcategory, start, end, id){
			
	atomList.push({
		"start":Number(start),
		"end":Number(end),
		"category":Number(category),
		"subcategory":Number(subcategory),
		"id":Number(id)
		});
}


/*
 * */
function minMaxCase (start, end){
	
	var min = $("#text").position().left; 
	var max = $("#text").position().left + $("#text").width();
		
	// Case A
	//  __
	// |__|
	if (start == min && end == max){
		return 'A';
	}
	
	// Case B:
	//	___
	// |  _|
	// |_|
	if(start == min && end < max){
		return 'B';
	}
	
	// Case C:
	//   __
	// _|  |
	//|____|
	if(start > min && end == max){
		return 'C';
	}
	
	// Case D:
	//    ___
	//  _|  _|
	// |___|
	if(start > min && end < max){
		return 'D';
	}
}