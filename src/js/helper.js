var Overlap = window.Overlap = Overlap || {};
Overlap.helper = {};
Overlap.helper.textContent;

/* Gets the real selection (start, end), by comparing the user selection and
the span wrapped text. It calculates the start and end offset.*/
Overlap.helper.getRealSelection = function(text){

	$("#text").selection(Overlap.savedClick["start"],
		Overlap.savedClick["end"]);

	var spans = $("#text").wrapSelection();

	var spanText = "";

	spans.each(function(){
		spanText += $(this).text();
		spanText += "\n\n";
	});

	var startOffset = spanText.indexOf(text);
	var endOffset = spanText.length - startOffset - text.length - 2;

	Overlap.helper.removeSpans();

	return {"start": Overlap.savedClick["start"] - startOffset,
		"end": Overlap.savedClick["end"] + endOffset};
}

Overlap.helper.removeSpans = function(){
	$("#text").html(Overlap.helper.textContent.html());
}


Overlap.helper.addAtomToAtomList = function(category, subcategory, start, end, id){

	Overlap.atomList.push({
		"start":Number(start),
		"end":Number(end),
		"category":Number(category),
		"subcategory":Number(subcategory),
		"id":Number(id)
		});
}

Overlap.helper.minMaxCase = function(start, end){

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