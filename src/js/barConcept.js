var Overlap = window.Overlap = Overlap || {};

Overlap.Bar = function (){

	var columnList = [];
	var atomList = Overlap.Atoms.getAtomList();

	/* Main method */
	this.run = function(){
		this.reset();
		render();
		display();
	};

	/* The reset function removes all existing Bars, also all needed
	global variables need to be reset, because they are going to be
	recalculated.	*/
	this.reset = function(){
		$(".bar").remove();
		columnList = [];
	};

	/* Helper function for render(). Adds a new colum to columnList. */
	var addNewColumnToColumnList = function(id, column, barTop, barHeight){
		columnList.push([{
			"id"				: Number(id),
			"barTop"		: Number(barTop),
			"barHeight"	: Number(barHeight),
			"column"		: Number(column)
			}]);
	};

	/* Helper function for render(). Adds a new bar to an existing column. */
	var addNewBarToColumn = function(id, column, barTop, barHeight){
		columnList[column].push({
			"id"				: Number(id),
			"barTop"		: Number(barTop),
			"barHeight"	: Number(barHeight),
			"column"		: Number(column)
			});
	};

	/* Helper function for render(). Tests if an atom fits into a column. */
	var fitsInColumn = function(atom, column, currentAtomTop, currentAtomHeight){

		// that is the atom which should fit into the active column
		var currentAtomEnd = currentAtomTop + currentAtomHeight;

		for (x in columnList[column]){

			// that is the iterating bar in the columnList
			var barInColumnTop =	columnList[column][x]["barTop"];
			var barInColumnEnd =	barInColumnTop +
														columnList[column][x]["barHeight"];

			if (currentAtomEnd < barInColumnTop || currentAtomTop > barInColumnEnd){
				continue;
			}
			return false;
		}
		return true;
	};

	/* The render function iterates all atoms, and recalculates the position of
	the corresponding bar and its column. */
	var render = function(){

		// *** calculating the bars
		for(atom in atomList){

			var start	= atomList[atom]["start"];
			var end 	= atomList[atom]["end"];

			// get the selection to wrap a span around it
			$("#text").selection(start, end);

			// add a span to selected text (when multiple elements
			// are crossed, more than one span is added)
			var span 			= $("#text").wrapSelection();

			var barTop 		= span.position().top;
			var barHeight = span.height();

			// different calcualtion if selection was across
			// multiple elements, so we have more that one span
			if (span.length > 1){
				var lastSpan 				= span.last();
				var lastSpanTop 		= lastSpan.position().top;
				var lastSpanHeight 	= lastSpan.height();
				barHeight 					= lastSpanTop - barTop + lastSpanHeight;
			}

			// remove the span(s) -> reset the text
			Overlap.Helper.removeSpans();

			// *** Adding the bar to the columnList
			var added = false;

			// if it is the first one
			if (columnList.length == 0){
				addNewColumnToColumnList(atom, 0, barTop, barHeight);
			}
			else {

				for(column in columnList){

					if(fitsInColumn(atom, column, barTop, barHeight) == true){
						addNewBarToColumn(atom, column, barTop, barHeight);
						added = true;
						break;
					}
				}

				// open a new column
				if (added == false){
					addNewColumnToColumnList(atom, Number(column) + 1, barTop, barHeight);
				}
			}
		}
	};

	var display = function(){

		for (i in columnList){
			for (j in columnList[i]){

				var bar 			= columnList[i][j];
				var barLeft 	= $("#text").position().left

				var offset 		= (Number(bar["column"]) * 5) +
												((Number(bar["column"]) + 1) * 10);
				var cssTop 		= bar["barTop"];
				var cssLeft 	= barLeft - offset - 18;
				var cssHeight = bar["barHeight"];
				var id 				= bar["id"];

				$(".container").append(
					'<div class="bar" id="barID_' + id + '">&nbsp;</div>'
					);

				$("#barID_"+id).css({
					"top"		: cssTop,
					"left"	: cssLeft,
					"height": cssHeight
				});

				$("#barID_"+id).addClass("bar_"+ atomList[id]["category"]);
			}
		}

		$("div.bar").hover(
			function () {
				Overlap.Helper.removeSpans();
				wrapAllLines($(this));
			},

			function () {
				Overlap.Helper.removeSpans();
			}
		);
	};

	var applyWrapCase = function(spanLines, category){

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
		if (Overlap.Helper.minMaxCase(start, end) == 'B'){
			if(len == 2){
				spanLines.first().addClass("topBottom");
				return;
			}
			/*last().prev() is not working ?-| */
			spanLines.slice(spanLines.length - 2, spanLines.length - 1).addClass("middleBottom");
		}

		// Case 5: C | 2 lines | 3 lines | >3 lines
		if(Overlap.Helper.minMaxCase(start, end) == 'C'){
			if(len == 2){
				spanLines.last().addClass("bottomTop");
				return;
			}
			spanLines.first().next().addClass("middleTop");
		}

		// Case 6: D | 2 lines | 3 lines | 4 lines | >4 lines
		if(Overlap.Helper.minMaxCase(start, end) == 'D'){
			if(len == 2){
				spanLines.first().addClass("topBottom");
				spanLines.last().addClass("bottomTop");
				return;
			}

			spanLines.first().next().addClass("middleTop");
			/*last().prev() is not working ?-| */
			spanLines.slice(spanLines.length - 2, spanLines.length - 1).addClass("middleBottom");
		}
	};

	var wrapAllLines = function(bar){

		var id 		= bar.attr("id").split("_")[1];
		var atom 	= atomList[id];

		$("#text").selection(atom["start"], atom["end"]);
		var spans = $("#text").wrapSelection();

		spans.wraplines();

		var spanLines = $("span[class^='wrap_line_']");

		spanLines.each(function(index, el){
			// Remove trailing whitespace
			var text = $(el).text().replace(/\s+$/, '')
			$(el).text(text);
		});

		applyWrapCase(spanLines, atom["category"]);
	};

	var getDisplayXBox = function(x){
		return $(".container").position().left + x;
	};
};