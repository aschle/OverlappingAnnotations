var Overlap = window.Overlap = Overlap || {};

Overlap.Border = function (){

	var levelList 				= [];
	var atomStartEndList 	= [];
	var atomList 					= Overlap.Atoms.getAtomList();

	var overlay 					= null;

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
				"startX"			: startX,
				"startY"			: startY,
				"endX"				: endX,
				"endY"				: endY,
				"type"				: type
				});

			Overlap.Helper.removeSpans();
		}
	}

	var render = function(){

		// *** calculating the level
		for(index in atomList){
			insert(index, 0);
		}
	}

	var getAllOverlaps = function(atomId, levelId){

		var overlapList = [];

		var aStart 	= atomList[atomId].start;
		var aEnd 		= atomList[atomId].end;

		// check for all atoms in the level the overlpping type:
		for (l in levelList[levelId]){

			var lStart 	= atomList[levelList[levelId][l]].start;
			var lEnd 		= atomList[levelList[levelId][l]].end;

			// No overlap:
			if(lEnd < aStart || aEnd < lStart){
				continue;
			}

			// Identity:
			if (aStart == lStart && aEnd == lEnd){
				overlapList.push({"type": 0, "index": l, "atomId": levelList[levelId][l]});
				continue;
			}

			// Overlap:
			if( (lStart < aStart && lEnd > aStart && lEnd < aEnd) ||
				(lEnd > aEnd && lStart > aStart && lStart < aEnd)){

				overlapList.push({"type": 1, "index": l, "atomId": levelList[levelId][l]});
				continue;
			}

			// else: Inclusion
			overlapList.push({"type": 2, "index": l, "atomId": levelList[levelId][l]});
		}
		return overlapList;
	}

	var insert = function(atomId, levelId){

		// *** if this level does not exist: add a new one
		if (levelList[levelId] == null){
			levelList.push([atomId]);
		}

		// *** find a fitting level
		else {

			var overlapList = getAllOverlaps(atomId, levelId);

			if(overlapList.length == 0){
				levelList[levelId].push(atomId);
			}
			else{
				// * more than one overlap: bubble up
				if(overlapList.length > 1){
					insert(atomId, levelId + 1);
				}
				// * only one overlap: decide which to bubble, depending on the
				// overlap type
				else {

					var type 		= overlapList[0].type;
					var index 	= overlapList[0].index;
					var id 			= overlapList[0].atomId;
					var aStart 	= atomList[atomId].start;
					var aEnd 		= atomList[atomId].end;
					var lAtom 	= atomList[id];

					// (0) Identity: does not matter which bubbles
					if (type == 0){
						insert(atomId, levelId + 1);
						return;
					}

					// (1) Overlap: longer one bubbles up
					if(type == 1){
						// check which one is longer
						if(aEnd - aStart >
							lAtom.end - lAtom.start){
							insert(atomId, levelId + 1);
						} else {
							var removedItem = levelList[levelId].splice(index, 1);
							levelList[levelId].push(atomId);
							insert(removedItem[0], 0);
						}
					}

					// (2) Inclusion: longer on bubbles up
					if(type == 2){
						// check which one is longer
						if(aEnd - aStart >
							lAtom.end - lAtom.start){
							insert(atomId, levelId + 1);
						} else {
							var removedItem = levelList[levelId].splice(index, 1);
							levelList[levelId].push(atomId);
							insert(removedItem[0], 0);
						}
					}

				} // * end: decide which to bubbel up

			} // ** end: somehow overlapping insert in level up

		} // *** end: find a fitting level
	}

	var fitsInLevel = function(atomId, levelId){

		var aStart 	= atomList[atomId].start;
		var aEnd 		= atomList[atomId].end;

		for(l in levelList[levelId]){

			var lStart 	= atomList[levelList[levelId][l]].start;
			var lEnd 		= atomList[levelList[levelId][l]].end;

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

				var id 					= levelList[i][j];
				var bubble 			= atomList[id];
				var coordinates = atomStartEndList[id];
				var type 				= coordinates.type;
				var category 		= atomList[id].category;
				var startX 			= coordinates.startX;
				var startY 			= coordinates.startY;
				var endX 				= coordinates.endX;
				var endY 				= coordinates.endY;
				var level 			= i;

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
							"all", level);
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
							"left", level);

						// second on the left
						top 	= endY - h - border - offset;
						left 	= min;
						width = endX - min + offset;

						addBubble(id, 2, top, left, height, width, offset, category,
							"right", level);
					}
					break;

			  	case 'B':
			  	{
			  		// first on the left I (corner_TL)
			  		top 		= startY - border - offset;
						left 		= startX - border - offset;
						height 	= endY - startY - lh + border + 2 * offset;
						width 	= max - startX + 2 * offset - (max - endX);

						addBubble(id, 1, top, left, height, width, offset, category,
							"cornerTL", level);

						// second on the right II
						left 		= endX + offset;
						height 	= endY - startY - lh + 2 * offset;
						width 	= max - endX;

						addBubble(id, 2, top, left, height, width, offset, category,
							"right", level);

						// third bottom left III
						top 		= endY - lh + border + offset;
						left 		= startX - border - offset;
						height 	= lh - border;
						width 	= endX - min + 2 * offset;

						addBubble(id, 3, top, left, height, width, offset, category,
							"bottom", level);
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
							"top", level);

						// second on the left
						top 		= startY + lh - border - offset;
						left 		= min - border - offset;
						height 	= endY - startY - lh + 2 * offset;
						width 	= startX - min;

						addBubble(id, 2, top, left, height, width, offset, category,
							"left", level);

						// third bottom right
						left 		= startX - offset;
						top 		= startY + border + lh - border - offset;
						height 	= endY - startY - lh + 2 * offset;
						width 	= endX - startX + 2 * offset;

						addBubble(id, 3, top, left, height, width, offset, category,
							"cornerBR", level);
			  	}
			  	break;

			  	case 'D':
			  	  	{
			  	  		// CASE I: 5 DIVs (in the middle no borders)
			  	  		if(startX <= endX){

					  		// first on the left I (corner_TL)
					  		top 		= startY + lh - border - offset;
								left 		= min - border - offset;
								height 	= endY - startY - lh + 2 * offset;
								width 	= startX - min;

								addBubble(id, 1, top, left, height, width, offset, category,
									"left", level);

								// // second on top II
								top 		= startY - border - offset;
								left 		= startX - border - offset;
								height 	= lh;
								width 	= max - startX + 2 * offset - (max - endX);

								addBubble(id, 2, top, left, height, width, offset, category,
									"cornerTL", level);

								// 4rd on the right III
								left 		= endX + offset;
								height 	= endY - startY - lh + 2 * offset;
								width 	= max - endX;

								addBubble(id, 3, top, left, height, width, offset, category,
									"right", level);

								// 4th on the bottom IV
								left 		= startX - offset;
								top 		= endY - lh + border + offset;
								height 	= lh - border;
								width 	= endX - startX + 2 * offset;

								addBubble(id, 4, top, left, height, width, offset, category,
									"cornerBR", level);

								// 5th in the middle
								top 		= startY + lh - offset;
								left 		= startX - offset;
								height 	= endY - startY - 2 * lh + 2 * offset + border;
								width 	= endX - startX + 2 * offset;

								if (!(height < 0 || width < 0)){
								addBubble(id, 5, top, left, height, width, offset, category,
									"", level);
							}
						}

						// CASE 2: 5 DIVs
						else {

							// first on the left I (corner_TL)
					  		top 		= startY + lh - border - offset;
								left 		= min - border - offset;
								height 	= endY - startY - 2 * lh + 2 * offset + border;
								width 	= endX - min + 2 * offset;

								addBubble(id, 1, top, left, height, width, offset, category,
									"cornerTL", level);

								// second on top Í
								top 		= startY - border - offset;
								left 		= startX - border - offset;
								height 	= lh;
								width 	= max - startX + 2 * offset;

								addBubble(id, 2, top, left, height, width, offset, category,
									"top", level);

								// 3rd on the right III
								top 		= startY + lh - offset;
								left 		= startX - offset;
								height 	= endY - startY - 2 * lh + 2 * offset;
								width 	= max - startX + 2 * offset;

								addBubble(id, 3, top, left, height, width, offset, category,
									"cornerBR", level);

								// 4th on the bottom IV
								top 		= endY - lh + border + offset;
								left 		= min - border - offset;
								height	= lh - border;
								width		= endX - min + 2 * offset;

								addBubble(id, 4, top, left, height, width, offset, category,
									"bottom", level);

								// 5th in the middle
								top 		= startY + lh - border - offset;
								left 		= endX + offset;
								height 	= endY - startY - 2 * lh + 2 * offset;
								width 	= startX -endX - 2 * offset;

								addBubble(id, 5, top, left, height, width, offset, category,
									"topBottom", level);
						}
					}
				  break;
				}
			}
		}
	}

	var addBubble = function(id, subId, top, left, height, width,
		offset, category, bubbleClass, level){

		var bubble = null;

		if(subId == null){

			$(".container").append(
				'<div class="bubble" id="bubbleID_' + id + '">&nbsp;</div>'
				);

			bubble = $("#bubbleID_" + id);

			bubble.css({
				"top"		 : top,
				"left"	 : left,
				"height" : height,
				"width"	 : width,
				"z-index": (100 - level)
			});

			bubble.addClass(bubbleClass);
			bubble.addClass("bubble_" + category);
			bubble.data({"id":id, "category":category});

		} else{

			$(".container").append(
				'<div class="bubble" id="bubbleID_' + id + '_' + subId + '">&nbsp;</div>'
				);

			bubble = $("#bubbleID_" + id + "_" + subId);
			bubble.css({
				"top"		: top,
				"left" 	: left,
				"height": height,
				"width" : width,
				"z-index": (100 - level)
			});

			bubble.addClass(bubbleClass);
			bubble.addClass("bubble_" + category);
			bubble.data({"id":id, "subId": subId, "category":category});
		}

		// HOVER EFFECT
		bubble.hover(
			function(){
				hoverIn($(this), offset);
			},

			function(){
				hoverOut($(this));
			});

		// REMOVE bubble
		bubble.mousedown(function(event){ 

	    if( event.button == 2 ) {
	    	var bubble = $(this);
				Overlap.Atoms.removeAtomWithId(bubble.data("id"));

				var all = getAllBubbles(id);

				all.fadeOut(600, function(){
	      	$(this).remove();
	      	Overlap.Border.run();
	      	hoverOut(bubble);
	      });
	      
	      return false; 
	    }
	    return true;
	  });
	}

	var getAllBubbles = function(id){

			var all = $("div[id^='bubbleID_" + id + "_']");

			if (all.length == 0){
				all = $("div[id='bubbleID_" + id + "']");
			}
			return all;
	}

	var hoverIn = function(elem, offset){

		var id 				= $(elem).data("id");
		var category 	= $(elem).data("category");

		var left 			= atomStartEndList[id].startX +
										$(".container").position().left - offset - 2;
		var top				= atomStartEndList[id].startY - offset - 2;
		
		// for shanging the bg color while hovering
		var all = getAllBubbles(id);

		all.addClass("light_" + category);

		overlay 	= new Overlap.Overlay(id, top, left);
		overlay.show();
	};

	var hoverOut = function(elem){

		overlay.hide();

		var id 				= $(elem).data("id");
		var category 	= $(elem).data("category");

		var all = getAllBubbles(id);
		
		console.log(all);
		all.removeClass("light_" + category);
	}
};

