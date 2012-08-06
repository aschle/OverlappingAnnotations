var Overlap = window.Overlap = Overlap || {};

Overlap.Overlay = function (id, top, left) {

	var atom 	= Overlap.Atoms.getAtomWithId(id);
	var cat 	= Overlap.categories[atom.category].name;
	var subcat 	= Overlap.categories[atom.category].subs[atom.subcategory];

	var data 	=	"<small> "
					+ cat + "<span class='font_" + atom.category + "'> ▶ </span>" + subcat + "</small>";

	// adding it to the body because to have it always on one line
	$("body").append(
		'<div class="tooltip" id="overlay_' + id + '">' + data + '</div>'
		);

	var overlay	= $("#overlay_" + id);

	overlay.css({
		"display"	: "none",
		"top"			: top - 3,
		"left"		: left + 20
	});

	this.show = function(id) {
		overlay.fadeIn(200);
	}

	this.hide = function(id) {
		overlay.fadeOut(200, function(){
			overlay.remove();
		});
	}
}