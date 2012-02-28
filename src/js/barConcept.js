var Overlap = window.Overlap = Overlap || {};
Overlap.bar = {};

Overlap.bar.columnList = [];

/*
The reset function removes all existing Bars, also all needed
global variables need to be reset, because they are going to be
recalculated.
*/
Overlap.bar.reset = function(){

	// before the bars are rendered, the old ones have to be removed
	$(".bar").remove();

	// all calculated global variables have to be reset
	Overlap.bar.columnList = [];
}

/*
Helper function for render(). Adds a new colum to columnList.
*/
Overlap.bar.addNewColumnToColumnList = function(id, column, barTop, barHeight){
	Overlap.bar.columnList.push([{
		"id":Number(id),
		"barTop":Number(barTop),
		"barHeight":Number(barHeight),
		"column":Number(column)
		}]);
}

/*
Helper function for render(). Adds a new bar to an existing column.
*/
Overlap.bar.addNewBarToColumn = function(id, column, barTop, barHeight){
	Overlap.bar.columnList[column].push({
		"id":Number(id),
		"barTop":Number(barTop),
		"barHeight":Number(barHeight),
		"column":Number(column)
		});
}

/*
Helper function for render().
Tests if an atom fits into a column.
*/
Overlap.bar.fitsInColumn = function(atom, column, currentAtomTop, currentAtomHeight){

	// that is the atom which should fit into the active column
	var currentAtomEnd = currentAtomTop + currentAtomHeight;

	for (x in Overlap.bar.columnList[column]){

		// that is the iterating bar in the columnList
		var barInColumnTop = Overlap.bar.columnList[column][x]["barTop"];
		var barInColumnEnd = barInColumnTop + Overlap.bar.columnList[column][x]["barHeight"];

		if (currentAtomEnd < barInColumnTop || currentAtomTop > barInColumnEnd){
			console.log("No Overlap!");
			continue;
		}
		return false;
	}
	return true;
}

/*
The render function iterates all atoms, and recalculates the
position of the corresponding bar and its column, also its hovering box.
*/
Overlap.bar.render = function(){

	// *** calculating the bars
	for(atom in Overlap.atomList){

		var start = Overlap.atomList[atom]["start"];
		var end = Overlap.atomList[atom]["end"];

		// remember the original content of the textFrame,
		// to easyly remove the span(s) later on
		var originalTextFrame = $("#text").clone();

		// get the selection to wrap a span around it
		$("#text").selection(start, end);

		// add a span to selected text (when multiple elements
		//are crossed, more than one span is added)
		var span = $("#text").wrapSelection();

		var barTop = span.position().top;
		var barHeight = span.height();

		// different calcualtion if selection was across
		// multiple elements, so we have more that one span
		if (span.length > 1){
			var lastSpan = span.last();
			var lastSpanTop = lastSpan.position().top;
			var lastSpanHeight = lastSpan.height();
			barHeight = lastSpanTop - barTop + lastSpanHeight;
		}

		// remove the span(s) -> reset the text
		var page = $("#text");
		page.html(originalTextFrame.html());


		// *** Adding the bar to the columnList
		var added = false;

		// if it is the first one
		if (Overlap.bar.columnList.length == 0){
			Overlap.bar.addNewColumnToColumnList(atom, 0, barTop, barHeight);
		}
		else {

			for(column in Overlap.bar.columnList){

				if(Overlap.bar.fitsInColumn(atom, column, barTop, barHeight) == true){
					Overlap.bar.addNewBarToColumn(atom, column, barTop, barHeight);
					added = true;
					break;
				}
			}

			// open a new column
			if (added == false){
				Overlap.bar.addNewColumnToColumnList(atom, Number(column) + 1, barTop, barHeight);
			}
		}
	}
}

Overlap.bar.display = function(){

	for (i in Overlap.bar.columnList){
		for (j in Overlap.bar.columnList[i]){

			var bar = Overlap.bar.columnList[i][j];

			var barLeft = Overlap.bar.getDisplayXBar(bar["left"]);
			var offset = (Number(bar["column"])*5) + ((Number(bar["column"])+1)*10);

			var cssTop = bar["barTop"];
			var cssLeft = barLeft - offset - 18;
			var cssHeight = bar["barHeight"];

			var id = bar["id"];

			$("body").append('<div class="bar" id="barID_'+id+'">&nbsp;</div>');
			$("#barID_"+id).css({"top":cssTop, "left":cssLeft, "height":cssHeight});
			$("#barID_"+id).addClass("bar_"+Overlap.atomList[id]["category"]);
		}
	}

	var originalContent = $("#text").clone();

	$("div.bar").hover(
		function () {
			$("#text").html(originalContent.html());
			Overlap.bar.wrapAllLines($(this));
		},

		function () {
			var content = $("#text");
			content.html(originalContent.html());
		}
	);
}

Overlap.bar.applyWrapCase = function(spanLines, category){

	var len = spanLines.length;
	var start = spanLines.first().position().left;
	var end = spanLines.last().position().left + spanLines.last().width();

	spanLines.addClass("hover");
	spanLines.addClass("light_" + category);

	// Case 1: 1 line -> single
	if(len == 1){
		spanLines.addClass("single");
		return;
	}

	// Case 2: 2 lines -> single
	if(len == 2 && start > end){
		spanLines.first().addClass("singleLeft");
		spanLines.last().addClass("singleRight");
		return;
	}

	spanLines.first().addClass("top");
	spanLines.last().addClass("bottom");

	// special treatment for "Absätze"
	var last = null;

	spanLines.each(function(index){
		console.log($(this));

		var classString = $(this).attr("class").split(" ")[0];

		if((classString == "wrap_line_1") && (last != null)){

			var max = Number($("#text").position().left) + Number($("#text").width());
			var rigth = last.position().left + last.width();
			var offsetX = max - rigth;
			var offsetY = $("p").css("margin-bottom");

			last.css("padding-right", offsetX);
			last.css("padding-bottom", offsetY);
			last.css("padding-bottom", "+="+1);
		}

		last = $(this);
	});

	// Case 3: A | 2 lines | >2 lines
	// do not need anymore

	// Case 4: B | 2 lines | 3 lines | >3 lines
	if (minMaxCase(start, end) == 'B'){
		if(len == 2){
			spanLines.first().addClass("topBottom");
			return;
		}
		/*last().prev() is not working ?-| */
		spanLines.slice(spanLines.length - 2, spanLines.length - 1).addClass("middleBottom");
	}

	// Case 5: C | 2 lines | 3 lines | >3 lines
	if(minMaxCase(start, end) == 'C'){
		if(len == 2){
			spanLines.last().addClass("bottomTop");
			return;
		}
		spanLines.first().next().addClass("middleTop");
	}

	// Case 6: D | 2 lines | 3 lines | 4 lines | >4 lines
	if(minMaxCase(start, end) == 'D'){
		console.log("len", len);
		if(len == 2){
			spanLines.first().addClass("topBottom");
			spanLines.last().addClass("bottomTop");
			return;
		}

		spanLines.first().next().addClass("middleTop");
		/*last().prev() is not working ?-| */
		spanLines.slice(spanLines.length - 2, spanLines.length - 1).addClass("middleBottom");
	}
}

Overlap.bar.wrapAllLines = function(bar){
	var id = bar.attr("id").split("_")[1];
	var atom = atomList[id];
	$("#text").selection(atom["start"], atom["end"]);
	var spans = $("#text").wrapSelection();
	spans.wraplines();
	applyWrapCase($("span[class^='wrap_line_']"), atom["category"]);
}

Overlap.bar.getDisplayXBar = function(x){

	var text = $("#text");
	var container = $(".container");

	// position for calculation
	var textLeft = text.position().left;
	var containerLeft = container.position().left;

	return containerLeft + textLeft;
}

Overlap.bar.getDisplayXBox = function(x){

	var text = $("#text");
	var container = $(".container");

	// position for calculation
	var textLeft = text.position().left;
	var containerLeft = container.position().left;

	return containerLeft + x;
}
