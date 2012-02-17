var atomList = [];
var columnList = [];
var boxList = [];

/*
Create a box belonging to the textatom, which is only active while
* hovering a bar.
*/
function createBox(start, end){
		
	// remember the original content of the textFrame,
	// to easyly remove the span(s) later on
	var originalTextFrame = $("#text").clone();
	
	var startLetter = $("#text").selection(start, Number(start)+1);
	var startLetterSpan = $("#text").wrapSelection({
		fitToWord: false
	});
	
	var endLetter = $("#text").selection(Number(end)-1, end);
	var endLetterSpan = $("#text").wrapSelection({
		fitToWord: false
	});
	
	var topLeft = {"x": startLetterSpan.position().left, "y":startLetterSpan.position().top};
	var bottomRight = {"x": Number(endLetterSpan.position().left)+Number(endLetterSpan.width()), "y": Number(endLetterSpan.position().top)+Number(endLetterSpan.height())};
	
	console.log(topLeft, bottomRight);
	
	boxList.push({
		"start":topLeft,
		"end":bottomRight
		});
		
	// remove the span(s) -> reset the text
	var page = $("#text");
	page.html(originalTextFrame.html());
	
	// add div (box) -> styled later on
	$("body").append('<div class="atom" id="atomID_'+(boxList.length-1) +'">&nbsp;</div>');
	
	var left = getDisplayXBox(topLeft["x"]);

	$("#atomID_"+(boxList.length-1)).css({
		"top":topLeft["y"],
		"left":left,
		"height":bottomRight["y"] - topLeft["y"],
		"width":bottomRight["x"]-topLeft["x"],
		"display":"none"
	});
	
	$("#atomID_"+(boxList.length-1)).addClass(atomList[boxList.length-1]["category"]);
}

function addAtomToAtomList(category, start, end){
			
	atomList.push({
		"start":Number(start),
		"end":Number(end),
		"category":String(category),
		"subcategory":0,
		});
}

	
/*
The reset function removes all existing Bars, also all needed
global variables need to be reset, because they are going to be
recalculated.
*/
function reset(){
	
	// before the bars are rendered, the old ones have to be removed
	$(".bar").remove();
	
	// all calculated global variables have to be reset
	columnList = [];
	boxList = [];
}

/*
Helper function for render(). Adds a new colum to columnList.
*/
function addNewColumnToColumnList(id, column, barTop, barHeight){
	columnList.push([{
		"id":Number(id),
		"barTop":Number(barTop),
		"barHeight":Number(barHeight),
		"column":Number(column)
		}]);
}

/*
Helper function for render(). Adds a new bar to an existing column.
*/
function addNewBarToColumn(id, column, barTop, barHeight){	
	columnList[column].push({
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
function fitsInColumn(atom, column, currentAtomTop, currentAtomHeight){
			
	// that is the atom which should fit into the active column
	var currentAtomEnd = currentAtomTop + currentAtomHeight;
	
	for (x in columnList[column]){
						
		// that is the iterating bar in the columnList
		var barInColumnTop = columnList[column][x]["barTop"];
		var barInColumnEnd = barInColumnTop + columnList[column][x]["barHeight"];
		
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
function render(){
		
	// *** calculating the bars
	for(atom in atomList){
				
		var start = atomList[atom]["start"];
		var end = atomList[atom]["end"];
		
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
}
	
function display(){
		
	for (i in columnList){
		for (j in columnList[i]){
			
			var bar = columnList[i][j];
						
			var barLeft = getDisplayXBar(bar["left"]);
			var offset = (Number(bar["column"])*5) + ((Number(bar["column"])+1)*10);
		
			var cssTop = bar["barTop"];
			var cssLeft = barLeft - offset - 18;
			var cssHeight = bar["barHeight"];
			
			var id = bar["id"];
			
			$("body").append('<div class="bar" id="barID_'+id+'">&nbsp;</div>');	
			$("#barID_"+id).css({"top":cssTop, "left":cssLeft, "height":cssHeight});
			$("#barID_"+id).addClass(atomList[id]["category"]);
		}
	}
	
	var originalContent = $("#text").clone();
	
	$("div.bar").hover(
		function () {
			wrapAllLines($(this));
		},
			
		function () {
			var content = $("#text");
			content.html(originalContent.html());
		}
	);
}

function applyWrapCase(spanLines){
	
	var len = spanLines.length;
	var start = spanLines.first().position().left;
	var end = spanLines.last().position().left + spanLines.last().width();
	
	spanLines.addClass("hover");
		
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
	var lastIndex = 0;
	spanLines.each(function(index){
		// TODO: hier weitermachen
	});
	
	// Case 3: A | 2 lines | >2 lines
	// do not need anymore
	
	// Case 4: B | 2 lines | 3 lines | >3 lines
	if (minMaxCase(start, end) == 'B'){				
		if(len == 2){
			spanLines.first().addClass("topBottom");
			return;
		}
		spanLines.last().prev().addClass("middleBottom");
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
		if(len == 2){
			spanLines.first().addClass("topBottom");
			spanLines.last().addClass("bottomTop");
			return;
		}
		
		spanLines.first().next().addClass("middleTop");
		spanLines.last().prev().addClass("middleBottom");
	}
}

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


function wrapAllLines(bar){
	var id = bar.attr("id").split("_")[1];
	var atom = atomList[id];
	$("#text").selection(atom["start"], atom["end"]);
	var spans = $("#text").wrapSelection();
	spans.wraplines();
	applyWrapCase($("span[class^='wrap_line_']"));
}

function getDisplayXBar (x){
	
	var text = $("#text");
	var container = $(".container");
	
	// position for calculation
	var textLeft = text.position().left;	
	var containerLeft = container.position().left;
	
	return containerLeft + textLeft;
}

function getDisplayXBox (x){
	
	var text = $("#text");
	var container = $(".container");
	
	// position for calculation
	var textLeft = text.position().left;	
	var containerLeft = container.position().left;
	
	return containerLeft + x;
}
