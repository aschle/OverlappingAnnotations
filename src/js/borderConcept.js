var Overlap = window.Overlap = Overlap || {};

Overlap.Border = function (){

	var levelList 				= [];
	var atomStartEndList 	= [];
	var atomList 					= Overlap.Atoms.getAtomList();

	this.run = function(){
		this.reset();
		letterToPixelPosition();
		render();
		display();
	}

	this.reset = function(){

		$(".bubble").remove();

		levelList 				= [];
		atomStartEndList	= [];
		atomList 					= Overlap.Atoms.getAtomList();
	}

	var letterToPixelPosition = function(){

		for(atom in atomList){

			$("#text").selection(atomList[atom]["start"], atomList[atom]["end"]);

			var spans = $("#text").wrapSelection({
	  			fitToWord: false
	  		});

			spans.wraplines();
			var spanLines = $("span[class^='wrap_line_']");

			spanLines.each(function(index, el){
				// Remove trailing whitespace
				var text = $(el).text().replace(/\s+$/, '')
				$(el).text(text);
			});

			var len 		= spanLines.length;
			var startX 	= spanLines.first().position().left;
			var startY 	= spanLines.first().position().top;
			var endX 		= spanLines.last().position().left + spanLines.last().width();
			var endY 		= spanLines.last().position().top + spanLines.last().height();


			var type;

			// Case 0: single line
			//  ____
			// |____|
			//
			if(len == 1){

				type = 'X';

			}else {
				// Case 1: 2 lines
				//		    ___
				// 	___	 |___
				//  ___|
				//
				if(len == 2 && startX > endX){
					type = 'Y';

				} else {

					// other Cases: A,B,C,D
					type = Overlap.Helper.minMaxCase(startX, endX);
				}
			}

			atomStartEndList.push({
				"id"					: atomList[atom]["id"],
				"startX"			: startX,
				"startY"			: startY,
				"endX"				: endX,
				"endY"				: endY,
				"category"		: atomList[atom]["category"],
				"subcategory"	: atomList[atom]["subcategory"],
				"type"				: type
				});

			Overlap.Helper.removeSpans();
		}
	}

	var render = function(){

		// *** calculating the level
		for(atom in atomList){
			insert(atomList[atom], 0);
		}
	}

	var insert = function(atom, level){

		// atom is an object and level is an index

		// *** if this level does not exist: add a new one
		if (levelList[level] == null){
			levelList.push([atom]);
		}

		// *** find a fitting level
		else {

			// ** fits in level: add it to the level
			if( fitsInLevel(atom, level) ){
				levelList[level].push(atom);
			}

			// ** if the atom is somehow overlapping: insert in a level up
			else{

				var overlaps = [];

				var aStart 	= atom["start"];
				var aEnd 		= atom["end"];

				// check for all atoms in the level the overlpping type:
				for (l in levelList[level]){

					var lStart 	= levelList[level][l]["start"];
					var lEnd 		= levelList[level][l]["end"];

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
							insert(removedItem[0], 0);
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
							insert(removedItem[0], 0);
						}
					}

				} // * end: decide which to bubbel ip

			} // ** end: somehow overlapping insert in level up

		} // *** end: find a fitting level
	}

	var fitsInLevel = function(atom, level){

		var aStart 	= atom["start"];
		var aEnd 		= atom["end"];

		for(l in levelList[level]){

			var lStart 	= levelList[level][l]["start"];
			var lEnd 		= levelList[level][l]["end"];

			if (!(lEnd < aStart || aEnd < lStart)){
				return false;
			}
		}
		return true;
	}

	var display = function(){

		var min 		= $("#text").position().left;
		var max 		= $("#text").position().left + $("#text").width();
		var h 			= 16; // TODO: why 16px?
		var lh 			= 21;  // TODO: why 21?
		var border 	= 2;

		var left, top, height, width;

		for (i in levelList){
			for (j in levelList[i]) {

				var bubble 			= levelList[i][j];
				var id 					= bubble["id"];
				var coordinates = atomStartEndList[id];
				var type 				= coordinates["type"];
				var category 		= atomList[id]["category"];
				var startX 			= coordinates["startX"];
				var startY 			= coordinates["startY"];
				var endX 				= coordinates["endX"];
				var endY 				= coordinates["endY"]

				var offset = i * 2 * border;

				switch (type)
				{
					case 'X': case 'A': // one line or block
					{
						top 		= startY - border - offset;
						left 		= startX - border - offset;
						height 	= endY - startY + 2 * offset;
						width 	= endX - startX + 2 * offset;

						addBubble (id, null, top, left, height, width, offset, category,
							"all");
					}
					break;

					case 'Y': // two lines, but seperate
					{
						// first on the right
						top 		= startY - border - offset;
						left 		= startX - border - offset;
						height 	= h + 2 * offset;
						width 	= max - startX + offset;

						addBubble(id, 1, top, left, height, width, offset, category,
							"left");

						// second on the left
						top 	= endY - h - border - offset;
						left 	= min;
						width = endX - min + offset;

						addBubble(id, 2, top, left, height, width, offset, category,
							"right");
					}
					break;

				  	case 'B':
				  	{
				  		// first on the left I (corner_TL)
				  		top 		= startY - border - offset;
							left 		= startX - border - offset;
							height 	= endY - startY - lh + border + 2 * offset;
							width 	= max - startX + 2 * offset;

							addBubble(id, 1, top, left, height, width, offset, category,
								"cornerTLTR");

							// second on the right II
							left 		= endX + offset;
							height 	= endY - startY - lh + 2 * offset;
							width 	= max - endX;

							addBubble(id, 2, top, left, height, width, offset, category,
								"right");

							// third bottom left III
							top 		= endY - lh + border + offset;
							left 		= startX - border - offset;
							height 	= lh - border;
							width 	= endX - min + 2 * offset;

							addBubble(id, 3, top, left, height, width, offset, category,
								"bottom");
				  	}
				  	break;

				  	case 'C':
				   	{
				  		// first on the top I (corner_TL)
				  		top 		= startY - border - offset;
							left 		= startX - border - offset;
							height 	= lh;
							width 	= max - startX + 2 * offset;

							addBubble(id, 1, top, left, height, width, offset, category,
								"top");

							// second on the left
							top 		= startY + lh - border - offset;
							left 		= min - border - offset;
							height 	= endY - startY - lh + 2 * offset;
							width 	= startX - min;

							addBubble(id, 2, top, left, height, width, offset, category,
								"left");

							// third bottom right
							left 		= startX - border - offset;
							top 		= startY + border + lh - border - offset;
							height 	= endY - startY - lh + 2 * offset;
							width 	= endX - startX + border + 2 * offset;

							addBubble(id, 3, top, left, height, width, offset, category,
								"cornerBR");
				  	}
				  	break;

				  	case 'D':
				  	  	{
				  	  		// CASE I: 4 DIVs
				  	  		if(startX <= endX){

						  		// first on the left I (corner_TL)
						  		top 		= startY + lh - border - offset;
									left 		= min - border - offset;
									height 	= endY - startY - lh + 2 * offset;
									width 	= startX - min;

									addBubble(id, 1, top, left, height, width, offset, category,
										"left");

									// // second on top Í
									top 		= startY - border - offset;
									left 		= startX - border - offset;
									height 	= lh;
									width 	= max - startX + 2 * offset;

									addBubble(id, 2, top, left, height, width, offset, category,
										"cornerTLTR");

									// 4rd on the right III
									left 		= endX + offset;
									height 	= endY - startY - lh + 2 * offset;
									width 	= max - endX;

									addBubble(id, 3, top, left, height, width, offset, category,
										"right");

									// 4th on the bottom IV
									left 		= startX - border - offset;
									top 		= endY - lh + border + offset;
									height 	= lh - border;
									width 	= endX - startX  + border + 2 * offset;

									addBubble(id, 4, top, left, height, width, offset, category,
										"cornerBR");
							}

							// CASE 2: 5 DIVs
							else {

								// first on the left I (corner_TL)
						  		top 		= startY + lh - border - offset;
									left 		= min - border - offset;
									height 	= endY - startY - lh + 2 * offset;
									width 	= endX - min + 2 * offset;

									addBubble(id, 1, top, left, height, width, offset, category,
										"cornerTLBL");

									// second on top Í
									top 		= startY - border - offset;
									left 		= startX - border - offset;
									height 	= lh;
									width 	= max - startX + 2 * offset;

									addBubble(id, 2, top, left, height, width, offset, category,
										"top");

									// 3rd on the right III
									top 		= startY + lh - border - offset;
									left 		= startX - offset;
									height 	= endY - startY - 2 * lh + 2 * offset + border;
									width 	= max - startX + 2 * offset;

									addBubble(id, 3, top, left, height, width, offset, category,
										"cornerBR");

									// 4th on the bottom IV
									top 		= endY - lh + border + offset;
									left 		= min - border - offset;
									height	= lh - border;
									width		= endX - min + 2 * offset;

									addBubble(id, 4, top, left, height, width, offset, category,
										"bottom");

									// 5th in the middle
									top 		= startY + lh - border - offset;
									left 		= endX + offset;
									height 	= endY - startY - 2 * lh + 2 * offset;
									width 	= startX -endX - 2 * offset;

									addBubble(id, 5, top, left, height, width, offset, category,
										"topBottom");
							}
						}
				  	break;
				}
			}
		}
	}

	var addBubble = function(id, subId, top, left, height, width,
		offset, category, bubbleClass){

		if(subId == null){

			$(".container").append(
				'<div class="bubble" id="bubbleID_' + id + '">&nbsp;</div>'
				);

			$("#bubbleID_"+id).css({
				"top"		: top,
				"left"	: left,
				"height": height,
				"width"	: width
			});

			$("#bubbleID_"+id).addClass(bubbleClass);
			$("#bubbleID_"+id).addClass("bubble_" + category);

		} else{

			$(".container").append(
				'<div class="bubble" id="bubbleID_' + id + '_' + subId + '">&nbsp;</div>'
				);

			$("#bubbleID_" + id + "_" + subId).css({
				"top"		: top,
				"left" 	: left,
				"height": height,
				"width" : width
			});

			$("#bubbleID_" + id + "_" + subId).addClass(bubbleClass);
			$("#bubbleID_" + id + "_" + subId).addClass("bubble_" + category);
		}
	}
};

