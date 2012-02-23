var levelList = [];
var atomStartEndList = [];

function reset(){
	
	// before the bars are rendered, the old ones have to be removed
	$(".bubble").remove();
	
	// all calculated global variables have to be reset
	levelList = [];
	atomStartEndList = [];
}

function calcAtomPositions(){
		
	for(atom in atomList){
		
		var start = atomList[atom]["start"];
		var end = atomList[atom]["end"];
		
		// note, almost same as in wrapAllLines(bar)
		$("#text").selection(start, end);
		var spans = $("#text").wrapSelection();
		spans.wraplines();
		var spanLines = $("span[class^='wrap_line_']");
				
		// NOTE: similar to applyWrapCase(spanLines, category)
		var len = spanLines.length;
		var startX = spanLines.first().position().left;
		var startY = spanLines.first().position().top;
		var endX = spanLines.last().position().left + spanLines.last().width();
		var endY = spanLines.last().position().top + spanLines.last().height();
		

		atomStartEndList.push({
			"startX": startX,
			"startY": startY,
			"endX": endX,
			"endY": endY,
			"category": atomList[atom]["category"],
			"subcategory": atomList[atom]["subcategory"]
			});
			
			console.log(atomStartEndList);
		
		$("#text").html(textContent.html());
	}
}
	
function render(){
	
	calcAtomPositions();

	// *** calculating the level
	for(atom in atomStartEndList){
						
		// *** Adding the atom to the levelList
		var added = false;
						
		// if it is the first one
		if (levelList.length == 0){
			levelList.push([atomStartEndList[atom]]);
		}
		else {
		
			if (foundFittingLevel(atom)){
				added == true;
				break;
			}
		}
			
		// open a new column
		if (added == false){
			levelList.push([atomStartEndList[atom]]);
		}
	}
}

function foundFittingLevel(atom){
	
	for(level in levelList){
		
		if(fitsInLevel(atom, level) == true){
			levelList[level].push(atomStartEndList[atom]);
		}
		else {
			
			var overlaps = getOverlapTypes(atom, level);
			console.log("OverlapTypes", overlaps);
		}
	}
}


var types = [];
function getOverlapTypes(atom, level){
	
	types = [];
	
	// idetity = 0
	// overlap = 1
	// inclusion = 2
	
	var aStartX = atomStartEndList[atom]["startX"];
	var aStartY = atomStartEndList[atom]["startY"];
	var aEndX = atomStartEndList[atom]["endX"];
	var aEndY = atomStartEndList[atom]["endY"];

		console.log(levelList[level].length)

	for (x in levelList[level]){
		
		var xStartX = levelList[level][x]["startX"];
		var xStartY = levelList[level][x]["startY"];
		var xEndX = levelList[level][x]["endX"];
		var xEndY = levelList[level][x]["endY"];
		
		console.log(xStartX, xStartY, xEndX, xEndY);
		
		// CASE 0: identity
		if(aStartX == xStartX && aStartY == xStartY && aEndX == xEndX && aEndY == xEndY){
			console.log("0 - identity");
			types.push({"atom":levelList[level][x], "type":0});
			continue;
		}
		
		// CASE 1: overlap
		if(isOverlap(aStartX, aStartY, aEndX, aEndY, xStartX, xStartY, xEndX, xEndY)){
			console.log("1 - overlap");
			types.push({"atom":levelList[level][x], "type":1});
			continue;
		}
		
		console.log("2 - inclusion");
		types.push({"atom":levelList[level][x], "type":2});
		continue;
	}
	return types;
}

function isInclusion(aStartX, aStartY, aEndX, aEndY, xStartX, xStartY, xEndX, xEndY){
	
	//inside:
	
	// gemeinsame anfangszeile
	if(xStartY == aStartY && xStartX >= aStartX){
		
		
		if(xEndY == aEndY && xEndX <= aEndX){
			// gemeinsame endzeile
			return true;
		}
		
		if(xEndY < aEndY && xEndY)
		
		
		
	}
	
	//outside:
	if(xStartY <= aStartY && xEndY >= aEndY)
}

/*
* Helper function for render().
* Tests if an atom fits into a level.
* An atom fits into a level, if it is not overlpping at all. So the
* function test for an atom if there is an overlap with each atom  in a
* level.
*/
function fitsInLevel(atom, level){
	
	var currLevel = levelList[level];
	var currAtom = atomStartEndList[atom];
	
	var aStartX = currAtom["startX"];
	var aStartY = currAtom["startY"];
	var aEndX = currAtom["endX"];
	var aEndY = currAtom["endY"];
					
	for (x in currLevel){
		
		var xStartX = currLevel[x]["startX"];
		var xStartY = currLevel[x]["startY"];
		var xEndX = currLevel[x]["endX"];
		var xEndY = currLevel[x]["endY"];
		
		
		// Y-values: aStart und xEnd are in one line:
		if (isInSameLine(aStartY, xEndY)){
			// X-values: xEnd is left of aStart
			if (xEndX <= aStartX){
				continue;
			}
		}
		
		// Y-values: if aEnd and xStart are in one line:
		if(isInSameLine(xStartY, aEndY)){
			// X-values: xStart iss right of aEnd
			if(xStartX >= aEndX){
				continue;
			}
		}
		
		if(aStartY > xEndY || xStartY > aEndY){
			continue;
		}
		
		console.log("OVERLAP");
		return false;
	}
	
	console.log("NO OVERLAP");
	return true;		
}

function isInSameLine(startY, endY){
	var h = 16;  // at the moment 16px
	return (startY + h) == endY;
}


function display(){

}
