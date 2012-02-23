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
		
		// only single line atoms are important for now
		if(len == 1){
			atomStartEndList.push({"startX": startX, "startY": startY, "endX": endX, "endY": endY, "category": atomList[atom]["category"]});
		}
		
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
			console.log("Lenght = 0; fit in level", 0);
		}
		else {
		
			for(level in levelList){
			
				if(fitsInLevel(atom, level) == true){
					levelList[level].push(atomStartEndList[atom]);
					added = true;
					console.log("For: fit in level", level);
					break;
				}
				else {
					// overlap happend
					for (a in levelList[level]){
						var type = getOverlappingType(levelList[level][a], atomStartEndList[atom]);
						console.log("Overlapping Type", type);
					}
				}
			}
			
			// open a new column
			if (added == false){
				levelList.push([atomStartEndList[atom]]);
			}
		}
	}
}

function getOverlappingType(atomInLevel, atom){
	
	var aLstartX = atomInLevel["startX"];
	var aLendX = atomInLevel["endX"];
	var aLstartY = atomInLevel["startY"];
	var aStartX = atom["startX"];
	var aEndX = atom["endX"];
	var aStartY = atom["startY"];
	

	if (aLstartY == aStartY){
		
		console.log("Tyep: same row");
		console.log("StartX1", aLstartX, "EndX1", aLendX, "StartX2", aStartX, "EndX2", aEndX);

		// CASE 1: Identity
		if(aLstartX == aStartX && aLendX == aEndX){
			return 1;
		}

		// CASE 2: Inclusion
		// 		|----------| (thats what we have)
		//		|------------->|
		//	|<-------------|
		//  |<---------------->|
		//		|-------<|
		//        |>-------|
		// 		  |>----<|
		if(	(aStartX<aLstartX && ((aEndX==aLendX)||(aEndX>aLendX)))||
			(aStartX==aLstartX && ((aEndX>aLstartX && aEndX<aLendX)||(aEndX>aLendX)))||
			(aStartX>aLstartX && aStartX<aLendX && ((aEndX > aLstartX && aEndX < aLendX) || (aEndX == aLendX)))){
			return 2;
		}
		
		// CASE 3: Overlap
		if((aLstartX < aStartX && aLendX > aStartX && aLendX < aEndX) || (aLstartX > aStartX && aLstartX < aEndX && aLendX > aEndX)){
			return 3;
		}
	}
	
	// no Overlap:
	return 0;
}

/*
Helper function for render().
Tests if an atom fits into a level.
*/
function fitsInLevel(atom, level){
	
	var currLevel = levelList[level];
	var currAtom = atomStartEndList[atom];
	
	var currStartX = currAtom["startX"];
	var currEndX = currAtom["endX"];
	var currStartY = currAtom["startY"];
					
	for (a in currLevel){
		
		// if there are in the same row
		if (currLevel[a]["startY"] == currStartY){
			if(currLevel[a]["endX"] < currStartX || currEndX < currLevel[a]["startX"]){
				continue;
			}
			return false;
		}
	}
	return true;		
}


function display(){

}
