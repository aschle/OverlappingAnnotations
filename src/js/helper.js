var Overlap = window.Overlap = Overlap || {};
Overlap.Helper = {};

/* Gets the real selection (start, end), by comparing the user selection and
the span wrapped text. It calculates the start and end offset.*/
Overlap.Helper.getRealSelection = function(text){

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

	Overlap.Helper.removeSpans();

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