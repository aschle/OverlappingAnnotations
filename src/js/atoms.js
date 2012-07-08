var Overlap = window.Overlap = Overlap || {};


Overlap.Atoms = function(){

	var atomList = [];

	this.addAtom = function(category, subcategory, start, end){

		atomList.push({
			"start"				: Number(start),
			"end"					: Number(end),
			"category"		: Number(category),
			"subcategory"	: Number(subcategory)
			});
	};

	this.getAtomList = function(){
		return atomList;
	};

	this.getLength = function(){
		return atomList.length;
	};

	this.getAtomWithId = function(id){
		return atomList[id];
	}

	this.setAtomList = function(newList){
		atomList = newList;
	}

	this.removeAtomWithId = function(id){
		atomList.splice(id, 1);
	}
};