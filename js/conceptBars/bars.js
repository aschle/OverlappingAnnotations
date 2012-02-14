var atomList = [];
var columnList = [];

var savedClick;

var overlapTop;
var overlapBottom;

function addAtomToAtomList(category){
	
	// remember the original content of the textFrame,
	// to easyly remove the span(s) later on
	var originalTextFrame = $("#text").clone();
		
	// get the selection to wrap a span around it
	var startPosInText = savedClick["start"];
	var endPosInText = savedClick["end"];
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
	
	atomList.push({
		"start":Number(startPosInText),
		"end":Number(endPosInText),
		"category":String(category),
		"subcategory":0,
		"barTop":Number(barTop),
		"barHeight":Number(barHeight)
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
	savedClick = null;
	overlapTop = 0;
	overlapBottom = 0;
}

/*
Helper function for render(). Adds a new colum to columnList.
*/
function addNewColumnToColumnList(id, column){
	columnList.push([{
		"id":Number(id),
		"overlapTop":Boolean(0),
		"overlapBottom":Boolean(0),
		"column":Number(column)
		}]);
}

/*
Helper function for render(). Adds a new bar to an existing column.
*/
function addNewBarToColumn(id, column){	
	columnList[column].push({
		"id":Number(id),
		"overlapTop":Boolean(overlapTop),
		"overlapBottom":Boolean(overlapBottom),
		"column":Number(column)
		});
	
	overlapTop = false;
	overlapBottom = false;
}

/*
Helper function for render().
Tests if an atom fits into a column.
*/
function fitsInColumn(atom, column){	
	
	var currentColumn = columnList[column];
	var currentAtom = atomList[atom];
	
	// that is the atom which should fit into the active column
	var bTop = currentAtom["barTop"];
	var bEnd = bTop + currentAtom["barHeight"];
	
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
		
		// TEST FOR PSEUDO-OVERLAPS (not used anymore)
		//else {
			//// before return, check if it was a "real" overlap
			//// if the letter positions where overlapping!
			//var bStartPos = currentAtom["start"];
			//var bEndPos = currentAtom["end"];
			//var aStartPos = atomList[bar["id"]]["start"];
			//var aEndPos = atomList[bar["id"]]["end"];
			
			//if (bEndPos < aStartPos || bStartPos > aEndPos){
				
				//console.log("Pseudo-Overlap!");
				
				//// what exactly is overlapping?						
				//if (bEnd > aTop && bEnd < aEnd && bTop < aTop){
					//overlapBottom = true;
					//bar["overlapTop"] = true;
				//}
				//if (bTop > aTop && bTop < aEnd && bEnd > aEnd){
					//overlapTop = true;
					//bar["overlapBottom"]= true;					
				//}
				
				//continue;
			//}
			
			//console.log("Overlap!");
			
			//return false;					
		//}
	}
	return true;			
}

/*
The render function iterates all atoms, and recalculates the
position of the corresponding bar, its column and also dealing
with pseudo overlaps.
*/
function render(){
	
	
	
	for(atom in atomList){
		
		var added = false;
		
		var overlapTop = 0;
		var overlapBottom = 0;
						
		// if it is the first one
		if (columnList.length == 0){
			addNewColumnToColumnList(atom, 0);
		}
		else {
		
			for(column in columnList){
			
				if(fitsInColumn(atom, column) == true){
					addNewBarToColumn(atom, column);
					added = true;
					break;
				}
			}
			
			// open a new column
			if (added == false){
				addNewColumnToColumnList(atom, Number(column) + 1);
			}
		}	
	}
	
	console.log("AlistAfterrender", atomList);
	console.log("ClistAfterrender", columnList);
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
			
			var barTop = atomList[bar["id"]]["barTop"];
			var barLeft = containerLeft + textLeft;
			var barHeight = atomList[bar["id"]]["barHeight"];
			
			// add div (vertical bar) -> styled later on
			$("body").append('<div class="bar" id="barID_'+bar["id"]+'">&nbsp;</div>');	
			
			var offset = (Number(bar["column"])*5) + ((Number(bar["column"])+1)*10);
		
			var cssTop = barTop;
			var cssLeft = barLeft - offset - 8;
			var cssHeight = barHeight;
			
			if (bar["overlapTop"] == true){
				cssTop = cssTop + 12;
				cssHeight = cssHeight - 12;
			}
			
			if (bar["overlapBottom"] == true){
				cssHeight = cssHeight - 12;
			}

			$("#barID_"+bar["id"]).css({"top":cssTop, "left":cssLeft, "height":cssHeight});
			$("#barID_"+bar["id"]).addClass(atomList[bar["id"]]["category"]);
		}
	}				
}
