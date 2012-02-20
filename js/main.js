var savedClick;
		
// Start Element, while selecting text.
var startElement = null;
var endElement = null;
					
function hoveringWords(){						
	$("#text .word_split span").mousedown(function(){
		
		console.log("span mouseDown");
		
		if (startElement && endElement){
			startElement.removeClass("permanentHover");
			endElement.removeClass("permanentHover");
			startElement = null;
			endElement = null;
		}
		
		startElement = $(this);
		$(this).addClass("permanentHover");
	});
	
	$("#text .word_split span").mouseup(function(){
		
		console.log("span mouseUp");
		
		endElement = $(this);
		$(this).addClass("permanentHover");
	});
}
		
$(document).ready(function(){
	
	// deals with STRG+ and STRG- and STRG0
	// TODO: when size is changed, need to rerender everything
	$(window).keydown(function(event) {
	  if(event.ctrlKey && event.keyCode == 189) { 
		console.log("Hey! Ctrl+- event captured!");
		event.preventDefault(); 
	  }
	  if(event.ctrlKey && event.keyCode == 187) { 
		console.log("Hey! Ctrl++ event captured!");
		event.preventDefault(); 
	  }
	  if(event.ctrlKey && event.keyCode == 48) { 
		console.log("Hey! Ctrl+0 event captured!");
		event.preventDefault(); 
	  }
	});
	
	// hover-effect for single words 
	$(".word_split").lettering('words');

	// for saving the start/end positions of the selected tex
	$("#text").mouseup(function(e){			
		
		// save the click
		var selectedText = $("#text").selection();
		savedClick = {
			"start":selectedText.start,
			"end":selectedText.end
			};
		
		if(startElement != null &&  endElement != null){
			showMenu(e, endElement);
		}
		
	});
	
	$("html").mousedown(function(e){
		
		console.log("html mouseDown");
		
		if(e.target.nodeName != "SPAN"){
			
			console.log("html no SPAN");
			if(startElement){
				startElement.removeClass("permanentHover");
				startElement = null;
			}
			
			if(endElement){
				endElement.removeClass("permanentHover");
				endElement = null;
			}
		}
	});
	
	hoveringWords();
});
