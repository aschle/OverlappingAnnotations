var atomList = [];
var columnList = [];
var boxList = [];

function addBoxToBoxList(start, end){
	
	// remember the original content of the textFrame,
	// to easyly remove the span(s) later on
	var originalTextFrame = $("#text").clone();
	
	var startLetter = $("#text").selection(start, Number(start)+1);
	var startLetterSpan = $("#text").wrapSelection();
	
	var endLetter = $("#text").selection(Number(end)-1, end);
	var endLetterSpan = $("#text").wrapSelection();
		
	var topLeft = {"x": startLetterSpan.position().left, "y":startLetterSpan.position().top};
	var bottomRight = {"x": Number(endLetterSpan.position().left)+Number(endLetterSpan.width()), "y": Number(endLetterSpan.position().top)+Number(endLetterSpan.height())};
	
	boxList.push = {"start":topLeft, "end":bottomRight};
		
	// remove the span(s) -> reset the text
	var page = $("#text");
	page.html(originalTextFrame.html());
	
	// add div (vertical bar) -> styled later on
	$("body").append('<div class="atom" id="atomID_'+boxList.length +'">&nbsp;</div>');	
	
	$("#atomID_"+boxList.length).css({"top":topLeft["y"], "left":topLeft["x"], "height":bottomRight["y"] - topLeft["y"]});	
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
	$(".special").remove();
	
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
function fitsInColumn(atom, column, bTop, bHeight){	
	
	var currentColumn = columnList[column];
	var currentAtom = atomList[atom];
	
	// that is the atom which should fit into the active column
	var bEnd = bTop + bHeight;
	
	for (x in currentColumn){
		
		var bar = currentColumn[x];
		
		// that is the iterating bar in the columnList
		var aTop = atomList[bar["id"]]["barTop"];
		var aEnd = aTop + atomList[bar["id"]]["barHeight"];
		
		if (bEnd < aTop || bTop > aEnd){
			console.log("No Overlap!");
			continue;
		}
		return false;
	}
	return true;			
}

/*
The render function iterates all atoms, and recalculates the
position of the corresponding bar and its column.
*/
function render(){
		
	for(atom in atomList){
		
		var currentAtom = atomList[atom];

		// remember the original content of the textFrame,
		// to easyly remove the span(s) later on
		var originalTextFrame = $("#text").clone();
			
		// get the selection to wrap a span around it
		var startPosInText = currentAtom["start"];
		var endPosInText = currentAtom["end"];
				
		var selectedAtom = $("#text").selection(startPosInText, endPosInText);
		
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
	
	var text = $("#text");
	var container = $(".container");
	
	// position for calculation
	var textLeft = text.position().left;	
	var containerLeft = container.position().left;
	
	for (i in columnList){
		for (j in columnList[i]){
			
			var bar = columnList[i][j];
			
			var barTop = bar["barTop"];
			var barLeft = containerLeft + textLeft -10;
			var barHeight = bar["barHeight"];
			
			// add div (vertical bar) -> styled later on
			$("body").append('<div class="bar" id="barID_'+bar["id"]+'">&nbsp;</div>');	
			
			var offset = (Number(bar["column"])*5) + ((Number(bar["column"])+1)*10);
		
			var cssTop = barTop;
			var cssLeft = barLeft - offset - 8;
			var cssHeight = barHeight;
			
			$("#barID_"+bar["id"]).css({"top":cssTop, "left":cssLeft, "height":cssHeight});
			$("#barID_"+bar["id"]).addClass(atomList[bar["id"]]["category"]);
		}
	}
	
	$("div.bar").mouseover(function(){
		console.log("MOUSEOVER BAR", $(this));
		
		// display the corresponding text
	});			
}
