var Overlap = window.Overlap = Overlap || {};
Overlap.Helper = {};

/* Gets the real selection (start, end), by comparing the user selection and
the span wrapped text. It calculates the start and end offset.*/
Overlap.Helper.getRealSelection = function(text){

	$("#text").selection(Overlap.savedClick["start"],
		Overlap.savedClick["end"]);

	var spanText = "";

	var spans = $("#text").wrapSelection();
	spans.each(function(){
		spanText += $(this).text();
		spanText += "\n\n";
	});
	Overlap.Helper.removeSpans();

    // Remove last linebreaks.
    spanText = spanText.substr(0, spanText.length - 2);

    // Test for leading and trailing punctuation and whitespace characters.
    var re = new RegExp(/[:,\s\.]/)

    var leadingPunct = 0;
    for(var idx = 0; re.test(text[idx]); idx++)
        leadingPunct++;

    var trailingPunct = 0;
    idx = text.length - 1;
    for(var idx = text.length - 1; re.test(text[idx]); idx--)
        trailingPunct++;

    // Test for additional characters in word-fitted selection.
    // Note that trimmedText's position in spanText is zero if there are leading whitespaces.
    var trimmedText = text.substr(leadingPunct, text.length - leadingPunct - trailingPunct);
    var pos = spanText.indexOf(trimmedText); 

    // Calculate offsets, also consider whitespaces/punctuation.
    var startOffset = (leadingPunct != 0) ? -leadingPunct : pos;
    var endOffset = (trailingPunct != 0) ? -trailingPunct : (spanText.length - trimmedText.length - pos);

	return {"start": Overlap.savedClick["start"] - startOffset,
		"end": Overlap.savedClick["end"] + endOffset};
}

Overlap.Helper.removeSpans = function(){
	$("#text").html(Overlap.textContent.html());
}

/* start and end are the X coordinates*/
Overlap.Helper.minMaxCase = function(start, end){

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

Overlap.Helper.appendRadioList = function(name){

		var list = Overlap.Storage.getAll();

		if(list.length == 0){
			$(".allInStorage").append("<span style='color:#ccc'>No saved Files yet.</span>");
		}

		for(item in list){
			var data = 	"<label for='radio_" + item + "'>" +
									"<input type='radio' name='"+ name +"'" +
									"id='radio_" + item + "' value='" + list[item] + "' />" +
									"<span>" + list[item] +"</span></label>";

			$(".allInStorage").append(data);
		}
}
