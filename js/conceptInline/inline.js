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
		if(len == 1 || (len ==2 && startX>endX) ){
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
		}
		else {
		
			for(level in levelList){
			
				if(fitsInLevel(atom, level) == true){
					levelList[level].push(atomStartEndList[atom]);
					added = true;
					break;
				}
				else {
					// overlap happend
					for (a in levelList[level]){
						var type = getOverlappingType(levelList[level][a], atom);
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
	
	var aLstart = atomInLevel["startX"];
	var aLend = atomInLevel["endX"];
	var aStart = atom["startX"];
	var aEnd = atom["endX"];

	// CASE 1: Identity
	if(aLstart == aStart && aLend == aEnd){
		return 1;
	}

	// CASE 2: Inclusion
	if((aLstart == aStart && aLend < aEnd) || (aLstart > aStart && aLend < aEnd) || (aLstart > aStart && aLend == aEnd )){
		return 2;
	}
	
	// CASE 3: Overlap
	if((aLstart < aStart && aLend > aStart && aLend < aEnd) || (aLstart > aStart && aLstart < aEnd && aLend > aEnd)){
		return 3;
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
	
	var currStart = currAtom["startX"];
	var currEnd = currAtom["endX"];
	
	console.log("atom:level", atom, level, "currStart:currEnd", currStart, currEnd);
					
	for (a in currLevel){
		if(currLevel[a]["endX"] < currStart || currEnd < currLevel[a]["endX"]){
			continue;
		}
		return false;
	}
	return true;		
}


function display(){

}
