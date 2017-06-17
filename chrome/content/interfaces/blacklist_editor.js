var blacklistService = null;

function onLoad() {
	ihg_Globals.blacklistFilePath = ihg_Globals.prefManager.getCharPref("extensions.imagegrabber.blacklistfilepath");
	initData();
	setFocus("blacklistTree");
}

function onUnLoad() {
}

function initData() {
	var doc = this.document;

	blacklistService = new ihg_Functions.blacklistService();

	if (blacklistService.blacklistFile) {
		var path = doc.getElementById("blacklistFilePath");
		path.value = blacklistService.blacklistFile.path;
	}	

	ihg_Globals.blacklist = blacklistService.readList();
	showList(ihg_Globals.blacklist);
}

function setFocus(id) {
	this.document.getElementById(id).focus();
}

function showList(pattList) {
	var doc = this.document;

	var tree = doc.getElementById("blacklistTree");
	var list = doc.getElementById("list");

	while (list.firstChild) {
		list.removeChild(list.firstChild);
	}

	for (var i = 0; i < pattList.length; i++) {
		var treeItem = doc.createElement("treeitem");
		treeItem.setAttribute("id", "item_" + i);

		var treeRow = doc.createElement("treerow");
		treeRow.setAttribute("id", "row_" + i);

		var treeCell0 = doc.createElement("treecell");
		treeCell0.setAttribute("label", ihg_Globals.strings[pattList[i].type]);
		treeCell0.setAttribute("value", pattList[i].type);
		treeCell0.setAttribute("editable", "false");
		treeCell0.setAttribute("id", "value_" + i);

		var treeCell1 = doc.createElement("treecell");
		treeCell1.setAttribute("label", pattList[i].value);
		treeCell1.setAttribute("value", pattList[i].value);
		treeCell1.setAttribute("editable", "false");
		treeCell1.setAttribute("id", "value_" + i);

		treeRow.appendChild(treeCell0);
		treeRow.appendChild(treeCell1);
		treeItem.appendChild(treeRow);
		list.appendChild(treeItem);
	}

	if (tree.view.rowCount > 0)
		tree.view.selection.select(0);

	checkTree();
}

function checkTree() {
	var doc = this.document;
	var tree = doc.getElementById("blacklistTree");

	if (tree.view.rowCount == 0) {
		doc.getElementById("modifyButton").disabled = true;
		doc.getElementById("removeButton").disabled = true;
		doc.getElementById("treeMenuModify").disabled = true;
		doc.getElementById("treeMenuRemove").disabled = true;
	}
	else {
		doc.getElementById("modifyButton").disabled = false;
		doc.getElementById("removeButton").disabled = false;
		doc.getElementById("treeMenuModify").disabled = false;
		doc.getElementById("treeMenuRemove").disabled = false;
	}
}

function addPattern() {
	var res = showNewDialog();

	if (!res) return;

	try {
		if (res.value == "") return;
		var ptype = res.type;
		if (ptype == "string") {
			ihg_Globals.blacklist.push({type: ptype, value: res.value, testValue: res.value.toLowerCase()});
		}
		else if (ptype == "regexp") {
			ihg_Globals.blacklist.push({type: ptype, value: res.value, testValue: new RegExp(res.value, "i")});
		}
	}	
	catch (ex) {
		// nothing to do
	}

	showList(ihg_Globals.blacklist);
}

showNewDialog = function showNewDialog() {
	var params = {inn: null, out: null};
	window.openDialog("chrome://imagegrabber/content/interfaces/blacklist_editor_new.xul", 
		"ig-filter_win", "chrome, dialog, modal, centerscreen, resizable", params);
	return params.out;
} 

function modifyPattern() {
	var doc = this.document;
	var tree = doc.getElementById("blacklistTree");
	if (tree.view.rowCount == 0) return;

	var currentIndex = tree.view.selection.currentIndex;	
	if (currentIndex < 0) return;

	var currentItem;
	try {
		currentItem = tree.view.getItemAtIndex(currentIndex);
	}
	catch (ex) {
		return;
	}

	var patternValue = currentItem.firstChild.childNodes[1].getAttribute("value");
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	var input = {value: patternValue};   
	var check = {value: false};
	var modified = promptService.prompt(this, ihg_Globals.appName, ihg_Globals.strings.enter_new_value,
										input, null, check);

	if (modified && input.value != "") {
		currentItem.firstChild.childNodes[1].setAttribute("label", input.value);
		currentItem.firstChild.childNodes[1].setAttribute("value", input.value);
		ihg_Globals.blacklist[currentIndex].value = input.value;
	}
}

function removePattern() {
	var doc = this.document;
	var tree = doc.getElementById("blacklistTree");
	if (tree.view.rowCount == 0) return;

	var currentIndex = tree.view.selection.currentIndex;	
	if (currentIndex < 0) return;

	var currentItem;
	try {
		currentItem = tree.view.getItemAtIndex(currentIndex);
	}
	catch (ex) {
		return;
	}

	var list = doc.getElementById("list");
	list.removeChild(currentItem);
	ihg_Globals.blacklist.splice(currentIndex, 1);
	checkTree();
	tree.view.selection.select(currentIndex);
}


function changeFile() {
	var doc = this.document;
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	var title = ihg_Globals.strings.select_blacklist_file;

	fp.init(this, title, nsIFilePicker.modeOpen);
	if (blacklistService.blacklistFile) {
		fp.displayDirectory = blacklistService.blacklistFile.parent;
	}
	fp.appendFilters(nsIFilePicker.filterXML);
	fp.appendFilters(nsIFilePicker.filterAll);

	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		if (fp.file && (fp.file.path.length > 0)) {
			ihg_Globals.prefManager.setCharPref("extensions.imagegrabber.blacklistfilepath", fp.file.path);
			ihg_Globals.blacklistFilePath = fp.file.path;
			initData();
		}
	}
}

function doOK() {
	blacklistService.writeList(ihg_Globals.blacklist);
	return true;
}
