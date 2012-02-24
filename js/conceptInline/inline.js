var levelList = [];
var atomStartEndList = [];

function reset(){
	
	// before the bars are rendered, the old ones have to be removed
	$(".bubble").remove();
	
	// all calculated global variables have to be reset
	levelList = [];
	atomStartEndList = [];
}

/* It */
function calcAtomPositions(){
		
	for(atom in atomList){
		
		// note, almost same as in wrapAllLines(bar)
		$("#text").selection(atomList[atom]["start"], atomList[atom]["end"]);

		var spans = $("#text").wrapSelection({
  			fitToWord: true
  		});

		spans.wraplines();
		var spanLines = $("span[class^='wrap_line_']");
				
		// NOTE: similar to applyWrapCase(spanLines, category)
		var len = spanLines.length;
		var startX = spanLines.first().position().left;
		var startY = spanLines.first().position().top;
		var endX = spanLines.last().position().left + spanLines.last().width();
		var endY = spanLines.last().position().top + spanLines.last().height();
		

		var type;

		// Case 0: single line
		//  ____
		// |____|
		//
		if(len == 1){

			type = 'X';

		}else {
			// Case 1: 2 lines
			//		  ___
			// 	___	 |___
			//  ___|	
			//	
			if(len == 2 && startX > endX){
				type = 'Y';

			} else {

				// other Cases: A,B,C,D
				type = minMaxCase(startX, endX);
			}
		}
		
		atomStartEndList.push({
			"id": atomList[atom]["id"],
			"startX": startX,
			"startY": startY,
			"endX": endX,
			"endY": endY,
			"category": atomList[atom]["category"],
			"subcategory": atomList[atom]["subcategory"],
			"type": type
			});
		
		plainText();
	}
}
	
function render(){
	
	calcAtomPositions();

	// *** calculating the level
	for(atom in atomList){
		insert(atomList[atom], 0);
	}

	console.log(levelList);
}

function insert(atom, level){

	// atom is an object and level is an index

	// *** if this level does not exist: add a new one
	if (levelList[level] == null){
		levelList.push([atom]);
	}

	// *** find a fitting level
	else {

		// ** fits in level: add it to the level
		if(fitsInLevel(atom, level)){
			levelList[level].push(atom);
		}

		// ** if the atom is somehow overlapping: insert in a level up
		else{

			var overlaps = [];

			var aStart = atom["start"];
			var aEnd = atom["end"];
			
			// check for all atoms in the level the overlpping type:
			for (l in levelList[level]){

				var lStart = levelList[level][l]["start"];
				var lEnd = levelList[level][l]["end"];

				// No overlap:
				if(lEnd < aStart || aEnd < lStart){
					continue;
				}

				// Identity:
				if (aStart == lStart && aEnd == lEnd){
					overlaps.push({"type": 0, "atom": l});
					continue;
				}

				// Overlap:
				if( (lStart < aStart && lEnd > aStart && lEnd < aEnd) ||
					(lEnd > aEnd && lStart > aStart && lStart < aEnd)){

					overlaps.push({"type": 1, "atom": l});
					continue;
				}

				// else: Inclusion
				overlaps.push({"type": 2, "atom": l});
			
			} // end: for

			
			
			// * more than one overlap: bubble up
			if(overlaps.length > 1){
				insert(atom, level +1);
			}

			// * only one overlap: decide which to bubble, depending on the 
			// overlap type
			else {

				var lAtom = levelList[level][overlaps[0]["atom"]];

				// (0) Identity: does not matter which bubbles
				if (overlaps[0]["type"] == 0){
					insert(atom, level + 1);
					return;
				}

				// (1) Overlap: longer one bubbles up
				if(overlaps[0]["type"] == 1){
					// check which one is longer
					if(aEnd - aStart >
						lAtom["end"] - lAtom["start"]){
						insert(atom, level + 1);
					} else {
						var removedItem = levelList[level].splice(overlaps[0]["atom"], 1);
						levelList[level].push(atom);
						insert(removedItem, level + 1);
					}
				}

				// (2) Inclusion: longer on bubbles up
				if(overlaps[0]["type"] == 2){
					// check which one is longer
					if(aEnd - aStart >
						lAtom["end"] - lAtom["start"]){
						insert(atom, level + 1);
					} else {
						var removedItem = levelList[level].splice(overlaps[0]["atom"], 1);
						levelList[level].push(atom);
						insert(removedItem, level + 1);
					}
				}

			} // * end: decide which to bubbel ip

		} // ** end: somehow overlapping insert in level up

	} // *** end: find a fitting level
}

function fitsInLevel(atom, level){
	
	var aStart = atom["start"];
	var aEnd = atom["end"];

	for(l in levelList[level]){

		var lStart = levelList[level][l]["start"];
		var lEnd = levelList[level][l]["end"];

		if (!(lEnd < aStart || aEnd < lStart)){
			return false;
		}
	}
	return true;
}

function display(){
	
	for (i in levelList){
		for (j in levelList[i]) {
			
			var bubble = levelList[i][j];
			var coordinates = atomStartEndList[bubble["id"]];
			var type = coordinates["type"];

			var offset = i * 4;
			var id = bubble["id"];

			var min = $("#text").position().left; 
			var max = $("#text").position().left + $("#text").width();
			var height = 16; // TODO: why 16px?

			switch (type)
			{
				case 'X': case 'A':
				{
					// onle line
					var left = getDisplayXBar(coordinates["startX"]) - offset - 2;
					var top = coordinates["startY"] - offset - 2;
					var height = coordinates["endY"] - coordinates["startY"];
					var width = coordinates["endX"] - coordinates["startX"];
					var category = atomList[id]["category"];
					var bubbleClass = "bubble_all";

					addBubble(id, top, left, height, width,
						offset, category, bubbleClass);
				}
				break;

				case 'Y':
				{
					// two lines, but seperate

					// TODO: weitermachen addBubble benutzen!!!

					
					// first on the right
					var bubbleLeft = getDisplayXBar(coordinates["startX"]) - offset - 2;
					var bubbleTop = coordinates["startY"] - offset - 2;
					var bubbleHeight = height;
					var bubbleWidth = max - coordinates["startX"];

					$("body").append('<div class="bubble" id="bubbleID_'+id+'_1">&nbsp;</div>');	
					$("#bubbleID_"+id+"_1").css({
						"top":bubbleTop,
						"left":bubbleLeft,
						"height":bubbleHeight,
						"width":bubbleWidth,
						"padding": offset
					});
					$("#bubbleID_"+id+"_1").addClass("bubble_"+atomList[id]["category"]);
					$("#bubbleID_"+id+"_1").addClass("bubble_L");

					// second on the left
					bubbleLeft = getDisplayXBar(min) - offset - 2;
					bubbleTop = coordinates["endY"] - height -  offset - 2;
					bubbleWidth = coordinates["endX"] - min;

					$("body").append('<div class="bubble" id="bubbleID_'+id+'_2">&nbsp;</div>');	
					$("#bubbleID_"+id+"_2").css({
						"top":bubbleTop,
						"left":bubbleLeft,
						"height":bubbleHeight,
						"width":bubbleWidth,
						"padding": offset
					});
					$("#bubbleID_"+id+"_2").addClass("bubble_"+atomList[id]["category"]);
					$("#bubbleID_"+id+"_2").addClass("bubble_R");
				}
				break;

			  	case 'B':
			  	{
			  		// first on the left I (corner_TL)
					var bubbleLeft = getDisplayXBar(coordinates["startX"]) - offset - 2;
					var bubbleTop = coordinates["startY"] - offset - 2;
					var bubbleHeight = coordinates["endY"] - coordinates["startY"] - height;
					var bubbleWidth = max - coordinates["startX"];

					$("body").append('<div class="bubble" id="bubbleID_'+id+'_1">&nbsp;</div>');	
					$("#bubbleID_"+id+"_1").css({
						"top":bubbleTop,
						"left":bubbleLeft,
						"height":bubbleHeight,
						"width":bubbleWidth,
						"padding": offset
					});
					$("#bubbleID_"+id+"_1").addClass("bubble_"+atomList[id]["category"]);
					$("#bubbleID_"+id+"_1").addClass("bubble_L");

			  	}
			  	break;

			  	case 'C':
			  	document.write("Sleepy Sunday");
			  	break;

			  	case 'D':
			  	document.write("Sleepy Sunday");
			  	break;
			}
		}
	}
}

function getDisplayXBar (x){
	
	var text = $("#text");
	var container = $(".container");
	
	// position for calculation
	var textLeft = text.position().left;	
	var containerLeft = container.position().left;
	
	return containerLeft + x;
}

function addBubble(id, top, left, height, width,
						offset, category, bubbleClass){

	$("body").append('<div class="bubble" id="bubbleID_'+id+'">&nbsp;</div>');	
	$("#bubbleID_"+id).css({
		"top":top,
		"left":left,
		"height":height,
		"width":width,
		"padding": offset
	});
	$("#bubbleID_"+id).addClass("bubble_"+category);
	$("#bubbleID_"+id).addClass(bubbleClass);
}