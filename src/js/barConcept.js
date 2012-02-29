var Overlap = window.Overlap = Overlap || {};

Overlap.Bar = function (){

	var atomList 					= Overlap.Atoms.getAtomList();
	var atomStartEndList 	= [];
	var columnList 				= [];

	var overlay 					= null;

	/* Main method */
	this.run = function(){
		this.reset();
		letterToPixelPosition();
		render();
		console.log(columnList);
		display();
	};

	/* The reset function removes all existing Bars, also all needed
	global variables need to be reset, because they are going to be
	recalculated.	*/
	this.reset = function(){
		$(".bar").remove();
		$("div[id^='overlay_']").remove();

		columnList 				= [];
		atomStartEndList 	= [];
	};

	/* Uses the atom list to calculate the position of each bar.*/
	var letterToPixelPosition = function(){

		for(atom in atomList){

			// get the selection within the text
			$("#text").selection(atomList[atom].start, atomList[atom].end);

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

			atomStartEndList.push({
				"startY"	: barTop,
				"endY"		: barTop + barHeight,
				"height"	: barHeight
			});
		}
	};

	// *** calculating the columns
	var render = function(){
		for(index in atomStartEndList){
			insertBySizeASC(index, 0);
		}
	};

	var insertFirstFit = function(atomId, columnId){

		if (columnList[columnId] == null){
			columnList.push([atomId]);
		}
		else {

			var overlapList = getAllOverlaps(atomId, columnId);

			if(overlapList.length == 0) {
				columnList[columnId].push(atomId);
			}
			else {
				if(overlapList.length >= 1) {
					insertFirstFit(atomId, columnId + 1);
				}
			}
		}
	};

	var insertBySizeASC = function(atomId, columnId){

		if (columnList[columnId] == null){
			columnList.push([atomId]);
		}
		else {

			var overlapList = getAllOverlaps(atomId, columnId);

			if(overlapList.length == 0) {
				columnList[columnId].push(atomId);
			}
			else {
				if(overlapList.length > 1) {
					insertBySizeASC(atomId, columnId + 1);
				}
				else {
					// exactly one overlap:
					// the bigger one needs to move further
					var index							= overlapList[0].index;
					var id 								= overlapList[0].atomId;
					var atomIdHeight 			= atomStartEndList[atomId].height;
					var overlapAtomHeight	= atomStartEndList[id].height;

					if( atomIdHeight > overlapAtomHeight) {
							// bigger one moves further
							insertBySizeASC(atomId, columnId + 1);

						} else {

						// if same size (order according apperiance in text)
						if( atomIdHeight == overlapAtomHeight) {

							if( atomList[atomId].start > atomList[id].start ) {

									// move the one with id away
									var removedItem = columnList[columnId].splice(index, 1);
									columnList[columnId].push(atomId);
									insertBySizeASC(removedItem[0], columnId + 1);

							} else {
									insertBySizeASC(atomId, columnId + 1);
							}

						} else {
							var removedItem = columnList[columnId].splice(index, 1);
							columnList[columnId].push(atomId);
							insertBySizeASC(removedItem[0], columnId + 1);
						}
					}
				}
			}
		}
	};

	var getAllOverlaps = function(atomId, columnId){

		var overlapList = [];

		var startY  = atomStartEndList[atomId].startY;
		var endY 		= atomStartEndList[atomId].endY;

		for (x in columnList[columnId]){

			var currAtom 		= atomStartEndList[columnList[columnId][x]];
			var currStartY 	=	currAtom.startY;
			var currEndY 		=	currAtom.endY;

			if (!(endY < currStartY || startY > currEndY)){
				overlapList.push({
					"index"		: x,
					"atomId"	: columnList[columnId][x]
				});
			}
		}
		return overlapList;
	};

	var display = function(){

		// in columnList are only IDs

		for (i in columnList){
			for (j in columnList[i]){

				var barId 		= columnList[i][j];
				var gap 			= 5;
				var thickness	= 10;

				var y 				= atomStartEndList[barId].startY;
				var height 		= atomStartEndList[barId].height;
				var offset 		= (i * gap) + ((Number(i)+1) * thickness); // TODO remove numbers
				var x 				= Overlap.textX - offset - 18;

				$(".container").append(
					'<div class="bar" id="barID_' + barId + '">&nbsp;</div>'
					);

				$("#barID_" + barId).css({
					"top"		: y,
					"left"	: x,
					"height": height
				});

				$("#barID_" + barId).addClass("bar_" + atomList[barId].category);

				$("#barID_" + barId).data("id", barId);
				$("#barID_" + barId).data("category", atomList[barId].category);
				$("#barID_" + barId).data("subCategory", atomList[barId].subcategory);

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



	var hoverInBar = function(bar){

		var category  = bar.data("category");
		var id 				= bar.data("id");

		wrapAllLines(id);
		bar.addClass("bubble_" + category);

		var left 	= $("span[class^='wrap_line_1']").first().position().left
									+ $(".container").position().left;
		var top 	= $("span[class^='wrap_line_1']").first().position().top;

		overlay 	= new Overlap.Overlay(id, top, left);
		overlay.show();
	}

	var hoverOutBar = function(bar){

		var category  = bar.data("category");
		var id 				= bar.data("id");

		bar.removeClass("bubble_" + category);
		Overlap.Helper.removeSpans();
		overlay.hide();
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