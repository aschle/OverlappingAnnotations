var Overlap = window.Overlap = Overlap || {};

/*http://coding.smashingmagazine.com/2010/10/11/local-storage-and-how-to-use-it/*/
Overlap.Storage = function(){

	this.save = function(name) {
		var atomList = Overlap.Atoms.getAtomList();
		localStorage.setItem("Overlap_" + name, JSON.stringify(atomList));
	};

	this.load = function(name) {
		var list = JSON.parse(localStorage.getItem("Overlap_" + name));
		Overlap.Atoms.setAtomList(list);
	};

	this.getAll = function() {

		var keys = Object.keys(localStorage);
		var returnList = [];

		for (i in keys) {

			if (keys[i].match("Overlap_")) {
				returnList.push(keys[i].split("_")[1]);
			}
		}

		return returnList;
	};
};