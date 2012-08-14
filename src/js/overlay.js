var Overlap = window.Overlap = Overlap || {};

Overlap.Overlay = function (id, top, left) {

	var atom 	= Overlap.Atoms.getAtomWithId(id);
	var cat 	= Overlap.categories[atom.category].name;
	var subcat 	= Overlap.categories[atom.category].subs[atom.subcategory];

	this.overlayId		= id;
	this.overlayTop		= top;
	this.overlayLeft	= left;

	var data 	=	"<small> "
					+ cat + "<span class='font_" + atom.category + "'> ▶ </span>" + subcat + "</small>";

	// adding it to the body because to have it always on one line
	$("body").append(
		'<div class="tooltip" id="overlay_' + id + '">' + data + '</div>'
		);

	var overlay	= $("#overlay_" + id);

	this.show = function() {
		overlay.fadeIn(100);
	}

	this.hide = function() {
		overlay.fadeOut(100, function(){
			overlay.remove();
		});
	}

	this.setTopAndHide = function(newtop){
		overlay.css({
			"display"	: "none",
			"top"		: newtop - 3,
			"left"		: left
		});
	}
	this.setTopAndHide(top);
}
