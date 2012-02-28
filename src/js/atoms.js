var Overlap = window.Overlap = Overlap || {};


Overlap.Atoms = function(){

	var atomList = [];

	this.addAtom = function(category, subcategory, start, end, id){

		atomList.push({
			"start"				: Number(start),
			"end"					: Number(end),
			"category"		: Number(category),
			"subcategory"	: Number(subcategory),
			"id"					: Number(id)
			});
	};

	this.getAtomList = function(){
		return atomList;
	};

	this.getLength = function(){
		return atomList.length;
	};

};