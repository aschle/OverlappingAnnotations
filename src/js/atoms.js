var Overlap = window.Overlap = Overlap || {};
Overlap.atoms = {};

Overlap.atoms.atomList = [];

Overlap.atoms.addAtom = function(category, subcategory, start, end, id){

	Overlap.atoms.atomList.push({
		"start":Number(start),
		"end":Number(end),
		"category":Number(category),
		"subcategory":Number(subcategory),
		"id":Number(id)
		});
}