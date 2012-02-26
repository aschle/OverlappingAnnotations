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
  			fitToWord: false
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
						insert(removedItem[0], level + 1);
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
						insert(removedItem[0], level + 1);
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

	var min = $("#text").position().left;
	var max = $("#text").position().left + $("#text").width();
	var h = 16; // TODO: why 16px?
	var lh = 21;  // TODO: why 21?

	var left, top, height, width;

	for (i in levelList){
		for (j in levelList[i]) {

			var bubble = levelList[i][j];
			var id = bubble["id"];
			var coordinates = atomStartEndList[id];
			var type = coordinates["type"];
			var category = atomList[id]["category"];
			var startX = coordinates["startX"];
			var startY = coordinates["startY"];
			var endX = coordinates["endX"];
			var endY = coordinates["endY"]

			var offset = i * 4;

			switch (type)
			{
				case 'X': case 'A':
				{
					// one line
					left = getDisplayXBar(startX) - offset - 2;
					top = startY - offset;
					height = endY - startY - 2;
					width = endX - startX;

					addBubble(id, null, top, left, height, width,
						offset, category, "bubble_all");
				}
				break;

				case 'Y':
				{
					// two lines, but seperate

					// first on the right
					left = getDisplayXBar(startX) - offset - 2;
					top = startY - offset;
					height = h - 2;
					width = max - startX;

					addBubble(id, 1, top, left, height, width, offset,
						category, "bubble_L");

					// second on the left
					left = getDisplayXBar(min) - offset - 2;
					top = endY - h -  offset;
					width = endX - min;

					addBubble(id, 2, top, left, height, width, offset,
						category, "bubble_R");
				}
				break;

			  	case 'B':
			  	{
			  		// first on the left I (corner_TL)
					left = getDisplayXBar(startX) - offset - 2;
					top = startY - offset;
					height = endY - startY - h - 2;
					width = max - startX;

					addBubble(id, 1, top, left, height, width, offset,
						category, "bubble_cornerTL");

					// second on the right II
					left = getDisplayXBar(endX) + offset - 2;
					height = endY - startY - lh - 2;
					width = max - endX - 2 * offset + 2;

					addBubble(id, 2, top, left, height, width, offset,
						category, "bubble_R");

					// third bottom left III
					left = getDisplayXBar(startX) - offset - 2;
					top = endY - lh + offset;
					height = lh - 2 * offset;
					width = endX - min - 2;

					addBubble(id, 3, top, left, height, width, offset,
						category, "bubble_B");
			  	}
			  	break;

			  	case 'C':
			   	{
			  		// first on the top I (corner_TL)
					left = getDisplayXBar(startX) - offset - 2;
					top = startY - offset;
					height = lh - 2 * offset;
					width = max - startX;

					addBubble(id, 1, top, left, height, width, offset,
						category, "bubble_T");

					// second on the left
					left = getDisplayXBar(min) - offset - 2;
					height = endY - startY - lh - 2;
					top = startY + lh - offset;
					width = startX - min - 2 * offset;

					addBubble(id, 2, top, left, height, width, offset,
						category, "bubble_L");

					// third bottom left
					left = getDisplayXBar(startX) - offset - 2;
					top = startY + 2+  lh - offset;
					height = endY - startY - lh - 2;
					width = endX - startX + 2;

					addBubble(id, 3, top, left, height, width, offset,
						category, "bubble_cornerBR");
			  	}
			  	break;

			  	case 'D':
			  	  	{
			  	  		// CASE I: 4 DIVs
			  	  		if(startX<= endX){

					  		// first on the left I (corner_TL)
							left = getDisplayXBar(min) - offset - 2;
							top = startY + lh - offset;
							height = endY - startY - lh - 2;
							width = startX - min - 2 * offset -2;

							addBubble(id, 1, top, left, height, width, offset,
								category, "bubble_L");

							// // second on top Í
							left = getDisplayXBar(startX) - offset - 2;
							top = startY - offset;
							height = lh - 2 * offset;
							width = max - startX;

							addBubble(id, 2, top, left, height, width, offset,
								category, "bubble_T");

							// third on the right III
							left = getDisplayXBar(endX) + offset + 2;
							top = startY - offset;
							height = endY - startY - lh - 2;
							width = max - endX - 2 - 2 * offset;

							addBubble(id, 3, top, left, height, width, offset,
								category, "bubble_R");

							// 4th on the bottom IV
							left = getDisplayXBar(min) + offset + 2;
							top = endY - lh;
							height = lh - 2;
							width = endX - min;

							addBubble(id, 4, top, left, height, width, offset,
								category, "bubble_B");
						}

						// CASE 2: 5 DIVs
						else {

						}
					}
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

function addBubble(id, subId, top, left, height, width,
						offset, category, bubbleClass){

	if(subId == null){

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

	} else{

		$("body").append('<div class="bubble" id="bubbleID_'+id+'_'+subId+'">&nbsp;</div>');
		$("#bubbleID_"+id+"_"+subId).css({
			"top":top,
			"left":left,
			"height":height,
			"width":width,
			"padding": offset
		});
		$("#bubbleID_"+id+"_"+subId).addClass("bubble_"+category);
		$("#bubbleID_"+id+"_"+subId).addClass(bubbleClass);

	}


}