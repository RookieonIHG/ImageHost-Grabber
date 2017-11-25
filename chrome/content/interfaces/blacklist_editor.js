var blacklistService = null;
var gblacklistView = null;

function initData() {
	var doc = this.document;

	blacklistService = new ihg_Functions.blacklistService();

	if (blacklistService.blacklistFile) {
		doc.getElementById("tb_blacklistFilePath").value = blacklistService.blacklistFile.path;
		}
	
	ihg_Globals.blacklist = blacklistService.readList();
	gblacklistView = new blacklistView(ihg_Globals.blacklist);
	doc.getElementById("blacklistTree").view = gblacklistView;

	setFocus("blacklistTree");
	}

function onUnLoad() {
	}


function setFocus(id) {
	this.document.getElementById(id).focus();
	}


function checkTree() {
	var doc = this.document;
	var tree = doc.getElementById("blacklistTree");

	if (gblacklistView.rowCount == 0) {
		doc.getElementById("treeIsEmpty").setAttribute('disabled', true);
		}
	else {
		doc.getElementById("treeIsEmpty").removeAttribute('disabled');
		}
	}


function changeFile() {
	var doc = this.document;
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);

	fp.init(this.window, ihg_Globals.strings.select_blacklist_file, nsIFilePicker.modeOpen);
	if (blacklistService.blacklistFile) {
		fp.displayDirectory = blacklistService.blacklistFile.parent;
		}
	fp.appendFilters(nsIFilePicker.filterXML);
	fp.appendFilters(nsIFilePicker.filterAll);

	if (fp.show() == nsIFilePicker.returnOK) {
		if (fp.file && (fp.file.path.length > 0)) {
			ihg_Globals.prefManager.setComplexValue("extensions.imagegrabber.blacklistfilepath", Components.interfaces.nsILocalFile, fp.file);
			initData();
			}
		}
	}


function doOK() {
	blacklistService.writeList(gblacklistView._blacklist);

	return true;
	}


function blacklistView(blacklist) {
	this._blacklist = blacklist;

	document.getElementById("blacklistTree").addEventListener("keypress", this, false);
	document.getElementById("blacklistTree").addEventListener("select", this, false);
	document.getElementById("blacklistTree").addEventListener("blur", this, true);
	}

blacklistView.prototype = {
	_blacklist: null,
	_treebox: null,

	handleEvent: function(aEvent) {
		if (aEvent.target.id != "blacklistTree") {ihg_Globals.Console.WriteLine("In blacklistView.handleEvent but target <> \"blacklistTree\""); return;};
		switch (aEvent.type) {
			case "keypress":
				let tree = aEvent.target;
				if (tree.hasAttribute("editing"))
					return;
				let isMac = Components.classes["@mozilla.org/xre/app-info;1"]
							.getService(Components.interfaces.nsIXULRuntime)
							.QueryInterface(Components.interfaces.nsIXULAppInfo).OS == "Darwin";
				if ((isMac && aEvent.keyCode == KeyEvent.DOM_VK_RETURN) || (!isMac && aEvent.keyCode == KeyEvent.DOM_VK_F2))
					tree.startEditing(this.selection.currentIndex, tree.columns.getNamedColumn("patternValue"));
				break;
			case "select":
				if (this.selection.currentIndex == -1 || this.rowCount == 0)
					document.getElementById("treeIsEmpty").setAttribute('disabled', true)
				else
					document.getElementById("treeIsEmpty").removeAttribute('disabled')
				break;
			case "blur":
				break;
			}
		},

	get lastIndex() {
		return this.rowCount - 1;
		},
	get selectedIndex() {
		var seln = this.selection;
		if (seln.getRangeCount() > 0) {
			var min = {};
			seln.getRangeAt(0, min, {});
			return min.value;
			}
		return -1;
		},
	get selectedPattern() {
		return this._blacklist[this.selectedIndex];
		},

	// Helpers
	rowCountChanged: function (index, count) {
		this._treebox.rowCountChanged(index, count);
		},
	invalidate: function () {
		this._treebox.invalidate();
		},
	ensureRowIsVisible: function (index) {
		this._treebox.ensureRowIsVisible(index);
		},
	isCheckBox: function(index, column) {
		return column.id == "patternType";
		},

  // nsITreeView
	get rowCount() {
		return this._blacklist.length;
		},
	getImageSrc: function(index, column) { },
	setTree: function(tree) {
		this._treebox = tree;
		},
	rowAdd: function(rowItem) {
		let tree = document.getElementById("blacklistTree");
		this._blacklist.push(rowItem);
		this.rowCountChanged(this.rowCount - 1, 1);
		this.selection.select(this.rowCount - 1);
		tree.startEditing(this.rowCount - 1, tree.columns.getNamedColumn("patternValue"));
		},
	rowRemove: function(/* rowItem */) {
		let selectedIndex = this.selection.currentIndex;
		if (selectedIndex < 0) return;
		this._blacklist.splice(selectedIndex, 1);
		this.invalidate();
		this.rowCountChanged(selectedIndex, -1);
		},
	selection: null,
	getRowProperties: function(index) { return null; },
	getCellProperties: function(index, column) { return ""; },
	getColumnProperties: function(column) { return ""; },
	isContainer: function(index) { return false; },
	isContainerOpen: function(index) { return false; },
	isContainerEmpty: function(index) { return false; },
	isSeparator: function(index) { return false; },
	isSorted: function(index) { return false; },
	getParentIndex: function(index) { return -1; },
	hasNextSibling: function(parentIndex, index) { return false; },
	getLevel: function(index) { return 0; },
	getProgressMode: function(index, column) { },
	getCellValue: function(index, column) {
		if (column.id == "patternType")
			switch (this._blacklist[index].type) {
				case "regexp" : return true;
				case "string" : return false;
			};
		return undefined;
		},
	getCellText: function(index, column) {
		if (column.id == "patternValue")
			return this._blacklist[index].value;
		return "";
		},
	toggleOpenState: function(index) { },
	cycleHeader: function(column) { },
	selectionChanged: function() {
		checkTree();
		},
	cycleCell: function(row, column) { },
	isEditable: function(index, column) { return true; },
	isSelectable: function(index, column) { return false; },
	setCellValue: function(index, column, type) {
		if (column.id == "patternType") {
			if (this.selection.currentIndex != index) {
				this.selection.select(index);
				return;
				}
			try {
				type == "true" ? new RegExp(this._blacklist[index].value, "i") : this._blacklist[index].value.toLowerCase();
				this._blacklist[index].type = type == "true" ? "regexp" : "string";
				}
			catch (e) {}
			}
		},
	setCellText: function(index, column, value) {ihg_Globals.Console.WriteLine("In blacklistView.setCellText");
		if (column.id == "patternValue") {
			try {
				this._blacklist[index].type == "regexp" ? new RegExp(value, "i") : value.toLowerCase();
				this._blacklist[index].value = value;
				}
			catch (e) {ihg_Globals.Console.WriteLine("Invalid pattern");}
			}
		},
	performAction: function(action) { },
	performActionOnRow: function(action, index) { },
	performActionOnCell: function(action, index, column) { }
	}