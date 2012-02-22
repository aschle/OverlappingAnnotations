function resetAppAfterAnnotation(){
	// hover-effect for single words 
	$(".word_split").lettering('words');
	
	$("#text .word_split span").mousedown(function(){
		startElement = $(this);
		console.log("startElement", startElement);
	});
	
	$("#text .word_split span").mouseup(function(){
		endElement = $(this);
		console.log("endElement", endElement);
	});
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

/* As we are using two plugins to get the user selected text and to wrap
 * a span around it, problems are arising. The selection plugin gets the
 * exact position of the selected text within an element. The plugin who
 * is wrapping spans around the user selection is "snapping" to complete
 * words. So the start and end positions are not very accurate. Actually
 * we need the exact start and end position to check for different kinds
 * of overlaps like inclusion, identity and overlap.
 * This function gets the start and end spans of the user selection (can
 * be empty), selection(start-end position) and the plain selected text.
 * It calculates the real selection range.
 * */
function getRealSelectionRange(startSpan, endSpan, selection, text){
	
	// there is an startSpan - if needed update it
	if(startSpan){
		selection = updateStart(startSpan, selection, text);	
	}
	
	// there is an endSpan - if needed update it 
	if(endSpan){
		selection = updateEnd(endSpan, selection, text);
	}
	
	// if there are no start/end - span, the selection is accurate
	return selection;
}

/* helper function for getRealSelectionRange()*/
function updateStart(startSpan, selection, text){
	var startBit = text.split(" ")[0];
	
	if (endsWith(startSpan, startBit)){
		var startOffset = startSpan.length - startBit.length;
		selection["start"] = selection["start"] - startOffset;
		return selection;
	}
}

/* helper function for getRealSelectionRange()*/
function updateEnd(endSpan, selection, text){
	var endBit = text.split(" ")[text.split(" ").length-1];
	
	if (startsWith(endSpan, endBit)){
		var endOffset = endSpan.length - endBit.length;
		selection["end"] = selection["end"] + endOffset;
		return selection;
	}
}

// http://stackoverflow.com/questions/280634/endswith-in-javascript
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// http://stackoverflow.com/questions/646628/javascript-startswith
function startsWith(str, prefix){
	return str.indexOf(prefix) == 0;
}
