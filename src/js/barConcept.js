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
		$("div[id^='overlay_']").remove();

		columnList = [];
	};

	/* Helper function for render(). Adds a new colum to columnList. */
	var addNewColumnToColumnList = function(id, column, barTop, barHeight, left){
		columnList.push([{
			"id"				: Number(id),
			"barTop"		: Number(barTop),
			"barHeight"	: Number(barHeight),
			"column"		: Number(column),
			"left"			: Number(left)
			}]);
	};

	/* Helper function for render(). Adds a new bar to an existing column. */
	var addNewBarToColumn = function(id, column, barTop, barHeight, left){
		columnList[column].push({
			"id"				: Number(id),
			"barTop"		: Number(barTop),
			"barHeight"	: Number(barHeight),
			"column"		: Number(column),
			"left"			: Number(left)
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
			var left 			= span.position().left; // for displaying the overlay

			// different calcualtion if selection was across
			// multiple elements, so we have more that one span
			if (span.length > 1){
				var lastSpan 				= span.last();
				var lastSpanTop 		= lastSpan.position().top;
				var lastSpanHeight 	= lastSpan.height();
				barHeight 					= lastSpanTop - barTop + lastSpanHeight;
			}

			// remove the span(s) -> reset the text
			Overlap.Helper.removeSpans(atom, barTop, barHeight, left);

			// insertFirstFit(columnList);

var added = false;

			// if it is the first one
			if (columnList.length == 0){
				addNewColumnToColumnList(atom, 0, barTop, barHeight, left);
			}
			else {

				for(column in columnList){

					if(fitsInColumn(atom, column, barTop, barHeight) == true){
						addNewBarToColumn(atom, column, barTop, barHeight, left);
						added = true;
						break;
					}
				}

				// open a new column
				if (added == false){
					addNewColumnToColumnList(atom, Number(column) + 1, barTop, barHeight,
						left);
				}
			}
			// TODO: weitermachen!!!
		}
	};

	var insertFirstFit = function(atom, barTop, barHeight, left){
		// *** Adding the bar to the columnList
			var added = false;

			// if it is the first one
			if (columnList.length == 0){
				addNewColumnToColumnList(atom, 0, barTop, barHeight, left);
			}
			else {

				for(column in columnList){

					if(fitsInColumn(atom, column, barTop, barHeight) == true){
						addNewBarToColumn(atom, column, barTop, barHeight, left);
						added = true;
						break;
					}
				}

				// open a new column
				if (added == false){
					addNewColumnToColumnList(atom, Number(column) + 1, barTop, barHeight,
						left);
				}
			}
	}

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
				var left 			= bar["left"];

				$(".container").append(
					'<div class="bar" id="barID_' + id + '">&nbsp;</div>'
					);

				$("#barID_" + id).css({
					"top"		: cssTop,
					"left"	: cssLeft,
					"height": cssHeight
				});

				$("#barID_" + id).addClass("bar_" + atomList[id]["category"]);

				$("#barID_" + id).data("id", id);
				$("#barID_" + id).data("category", atomList[id]["category"]);
				$("#barID_" + id).data("subCategory", atomList[id]["subcategory"]);

				addOverlay(id);

			}
		}

		$("div.bar").hover(
			function () {
				hoverInBar($(this));
			},

			function () {
				hoverOutBar($(this));
			}
		);
	};

	var addOverlay = function(id){
		// add overlay for subcategories but hide it
		var cat 		= Overlap.categories[atomList[id]["category"]]["name"];
		var subcat 	= Overlap.categories[atomList[id]["category"]]["subs"][atomList[id]["subcategory"]];

		var data 		= "<h5 style='display:inline'> " + cat + " </h5> ▶ " + subcat;

		$(".container").append(
			'<div class="popup shadow" id="overlay_' + id + '">' + data + '</div>'
			);
		var overlay = $("#overlay_" + id);
		overlay.css({"display"	: "none"});
	}

	var hoverInBar = function(bar){

		var category  = bar.data("category");
		var id 				= bar.data("id");

		wrapAllLines(id);

		var overlay = $("#overlay_" + id);
		var left 		= $("span[class^='wrap_line_1']").first().position().left;
		var top 		= $("span[class^='wrap_line_1']").first().position().top;

		overlay.css({
			"top"			: top - overlay.outerHeight() - 5,
			"left"		: left
		});

		overlay.fadeIn(200);

		bar.addClass("bubble_" + category);

	}

	var hoverOutBar = function(bar){

		var category  = bar.data("category");
		var id 				= bar.data("id");

		bar.removeClass("bubble_" + category);
		Overlap.Helper.removeSpans();
		$("#overlay_" + id).fadeOut(200);
	}

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

			var classString = $(this).attr("class").split(" ")[0];

			if((classString == "wrap_line_1") && (last != null)){

				var max = Number($("#text").position().left) + Number($("#text").width());
				var rigth = last.position().left + last.width();
				var offsetX = max - rigth;
				var offsetY = $("p").css("margin-bottom");

				last.css("padding-right", offsetX);
				last.css("padding-bottom", offsetY);
				last.css("padding-bottom", "+="+3);
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

	var wrapAllLines = function(id){

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