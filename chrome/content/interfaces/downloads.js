/****************************** Start of GPL Block ****************************
*   ImageHost Grabber - Imagegrabber is a firefox extension designed to 
*   download pictures from image hosts such as imagevenue, imagebeaver, and 
*   others (see help file for a full list of supported hosts).
*
*   Copyright (C) 2007   Matthew McMullen.
* 
*   This program is free software; you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation; either version 2 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program; if not, write to the Free Software
*   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*
***************************  End of GPL Block *******************************/

var content = window;
content.window = window;

var ihg_downloads_Globals = new Object();
ihg_downloads_Globals.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

ihg_Globals.strbundle = document.getElementById("imagegrabber-strings");
ihg_Functions.read_locale_strings();

function onUnLoad() {
	killme();
	var boolAutoSave = document.getElementById("cbAutoSaveSession");
	if (boolAutoSave.checked)
		saveSession("dlwin_exit_state");
}


function saveSession(fileName) {
	if (typeof(req_objs) == "undefined") return;

	var cacheDir =  Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);

	cacheDir.append("ihg_cache");
	if (!cacheDir.exists() || !cacheDir.isDirectory()) { 
		cacheDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);  
	}

	var aLocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	aLocalFile.initWithPath(cacheDir.path);

	if (fileName) {
		aLocalFile.append(fileName);
		var cacheFile = new ihg_Functions.dlWinCacheService(aLocalFile.target);
		cacheFile.writeCache(req_objs);
		return;
	}

	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, null, nsIFilePicker.modeSave);
	fp.displayDirectory = cacheDir;

	// We suggest a filename (different from the filenames of the existing files)
	var baseName = "dlwin_cache_";
	var postfix = 1;
	aLocalFile.append(baseName + postfix);

	while (aLocalFile.exists()) {
		postfix++;
		aLocalFile.initWithPath(cacheDir.path);
		aLocalFile.append(baseName + postfix);
	}
	fp.defaultString = baseName + postfix;

	var rv = fp.show();

	if (rv == nsIFilePicker.returnCancel) return;

	var cacheFile = new ihg_Functions.dlWinCacheService(fp.file.path);
	cacheFile.writeCache(req_objs);
}


function loadSession() {
	var tReqs = ihg_Functions.getDLCache();
	if (tReqs == null) return;
	req_objs = tReqs;
	
	var outBox = document.getElementById("outBox");
	var children = outBox.childNodes;
	
	for (var i = children.length - 1; i >= 0; i--)
		outBox.removeChild(children[i]);

	ihg_Globals.strbundle = document.getElementById("imagegrabber-strings");
	ihg_Functions.read_locale_strings();
	
	ihg_Functions.initVars(true); // true to suppress directory selection dialog

	
	for(var i = 0; i < req_objs.length; i++) {
		var m = req_objs[i].curLinkNum + 1;
		var page_stat = ihg_Globals.strings.page + " " + req_objs[i].pageNum + ": " + m + " " + ihg_Globals.strings.of + " " + req_objs[i].totLinkNum;
		ihg_Functions.addDownloadProgress(page_stat, req_objs[i].uniqID, req_objs[i].reqURL, req_objs[i].status);
		ihg_Functions.updateDownloadProgress(null, req_objs[i].uniqID, null, (req_objs[i].curProgress / req_objs[i].maxProgress) * 100, null);
	}	
}


function exportSession() {
	if (ihg_Globals.lastSessionDir) {
		var cacheDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		cacheDir.initWithPath(ihg_Globals.lastSessionDir);
	}
	else {
		var cacheDir =  Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		
		cacheDir.append("ihg_cache");
		if (!cacheDir.exists() || !cacheDir.isDirectory())
			cacheDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
	}
	
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, null, nsIFilePicker.modeOpen);
	fp.displayDirectory = cacheDir;
		
	var rv = fp.show();
	if (rv == nsIFilePicker.returnCancel) return null;

	var copyToDir = ihg_Functions.setDownloadDir("Pick a folder to copy the session file to.", null);

	if (!copyToDir) return;

	var newDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	newDir.initWithPath(copyToDir);

	try {
		fp.file.copyTo(newDir, null);
	}
	catch(e) {
		alert("Failed to copy session file.");
		return;
	}

	alert("Session file successfully copied.");
}


function reInitSession() {
}

function reset_retryCount() {
	var maxRetries = ihg_downloads_Globals.prefManager.getIntPref("extensions.imagegrabber.numretries");

	var outBox = document.getElementById("outBox");
	var tree = outBox.parentNode;

	var start = new Object();
	var end = new Object();
	var numRanges = tree.view.selection.getRangeCount();

	var daNodes = new Array();

	for (var t = 0; t < numRanges; t++){
		tree.view.selection.getRangeAt(t,start,end);
		for (var v = start.value; v <= end.value; v++) daNodes.push(tree.view.getItemAtIndex(v));
	}

	for (var s = 0; s < daNodes.length; s++) {
		var idx = daNodes[s].id;
		req_objs[idx].retryNum = maxRetries;
	}
}


function restart_child() {
	var outBox = document.getElementById("outBox");
	var tree = outBox.parentNode;

	var start = new Object();
	var end = new Object();
	var numRanges = tree.view.selection.getRangeCount();

	var daNodes = new Array();

	for (var t = 0; t < numRanges; t++){
		tree.view.selection.getRangeAt(t,start,end);
		for (var v = start.value; v <= end.value; v++) daNodes.push(tree.view.getItemAtIndex(v));
	}

	for (var s = 0; s < daNodes.length; s++) {
		var idx = daNodes[s].id;
		req_objs[idx].curProgress = 0;
		req_objs[idx].maxProgress = 0;
		req_objs[idx].retryNum++;
		req_objs[idx].overwrite = true;
		req_objs[idx].override_stop = true;
		req_objs[idx].retry();
	}
}


function remove_child() {
	abort_child();
	var outBox = document.getElementById("outBox");
	var tree = outBox.parentNode;

	var start = new Object();
	var end = new Object();
	var numRanges = tree.view.selection.getRangeCount();

	var daNodes = new Array();

	var removeList = new Array();
	var z = 0;

	var k = 0;
	for (var t = 0; t < numRanges; t++){
		tree.view.selection.getRangeAt(t,start,end);
		for (var v = start.value; v <= end.value; v++){
			daNodes[k] = tree.view.getItemAtIndex(v);
			k++;
		}
	}

	for (var i = 0; i < daNodes.length; i++) {
		outBox.removeChild(daNodes[i]);
		removeList[z++] = daNodes[i].id;
	}

	delete_from_req_objs(removeList);	

	if (start.value > 0) tree.view.selection.select(start.value-1);
	else tree.view.selection.select(0);
}


function abort_child() {
	var outBox = document.getElementById("outBox");
	var tree = outBox.parentNode;

	var start = new Object();
	var end = new Object();
	var numRanges = tree.view.selection.getRangeCount();

	var daNodes = new Array();

	for (var t = 0; t < numRanges; t++){
		tree.view.selection.getRangeAt(t,start,end);
		for (var v = start.value; v <= end.value; v++) daNodes.push(tree.view.getItemAtIndex(v));
	}

	for (var s = 0; s < daNodes.length; s++) {
		var idx = daNodes[s].id;
		req_objs[idx].abort();
	}

}


function retry_child() {
	var outBox = document.getElementById("outBox");
	var tree = outBox.parentNode;

	var start = new Object();
	var end = new Object();
	var numRanges = tree.view.selection.getRangeCount();

	var daNodes = new Array();

	for (var t = 0; t < numRanges; t++){
		tree.view.selection.getRangeAt(t,start,end);
		for (var v = start.value; v <= end.value; v++) daNodes.push(tree.view.getItemAtIndex(v));
	}

	for (var s = 0; s < daNodes.length; s++) {
		var idx = daNodes[s].id;
		req_objs[idx].retryNum++;
		req_objs[idx].overwrite = true;
		req_objs[idx].override_stop = true;
		req_objs[idx].retry();
	}
}


function autoClearForm() {
	var autoClear = document.getElementById("cbAutoClear").checked;

	if (autoClear) clear_form();
}


function clear_form() {
	var outBox = document.getElementById("outBox");

	var removeList = new Array();
	var z = 0;

	for (var i = 0; i < req_objs.length; i++) {
		try {
			var daNode = document.getElementById(req_objs[i].uniqID);
			var someShit = daNode.nodeName;
		}
		catch(e) { continue; }

		if(req_objs[i].finished == true && req_objs[i].aborted == false) {
			outBox.removeChild(daNode);
			removeList[z++] = req_objs[i].uniqID;
		}
	}

	delete_from_req_objs(removeList);
}


function delete_from_req_objs(removeList) {
	try {
		for (var i = removeList.length - 1; i >= 0; i--) {
			var reqChild = req_objs[removeList[i]];
			var index = reqChild.index;
			delete req_objs[removeList[i]];
			req_objs.splice(index, 1);
		}

		setUpLinkedList();
	}
	catch(e) {}
}


function killme() {
	ihg_downloads_Globals.prefManager.setBoolPref("extensions.imagegrabber.killmenow", true);

	var statLabel = document.getElementById("statLabel");
	statLabel.value = ihg_Globals.strings.stopping_the_program;

	var shit = document.getElementById("outBox");

	for(var i=0; i < shit.childNodes.length; i++) { 
		var idx = shit.childNodes[i].id; 
		req_objs[idx].override_stop = false;
		if(req_objs[idx].inprogress) {
			req_objs[idx].stopped = true;
			req_objs[idx].abort();
		}
	}
}


function reviveme() {
	ihg_downloads_Globals.prefManager.setBoolPref("extensions.imagegrabber.killmenow", false);

	var maxThreads = ihg_downloads_Globals.prefManager.getIntPref("extensions.imagegrabber.maxthreads");

	var statLabel = document.getElementById("statLabel");
	statLabel.value = ihg_Globals.strings.reviving_the_program;

	for (var i = 0; i < req_objs.length; i++) {
		if (req_objs[i].stopped) {
			req_objs[i].stopped = false;
			req_objs[i].finished = false;
			req_objs[i].aborted = false;
		}
	}

	if (req_objs.length > 0) req_objs[0].queueHandler();
}


function view_details() {
	var igTree = document.getElementById("igTree");
	var idx = igTree.view.selection.currentIndex;
	if (idx == -1) return;
	var daNode = igTree.view.getItemAtIndex(idx);
	var shit = daNode.id;

	var detail_win_obj = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
	var detail_win = detail_win_obj.getWindowByName("ig-detail_win", null);

	if (!detail_win) {
		detail_win = detail_win_obj.openWindow(null, "chrome://imagegrabber/content/interfaces/req_details.xul", "ig-detail_win", "resizable,scrollbars=yes", null);
		detail_win.reqObj = req_objs[shit];
		detail_win.addEventListener("load", rightOn, false);
	}
	else {
		detail_win.reqObj = req_objs[shit];
		rightOn();
	}
}


function rightOn() {
	var detail_win_obj = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
	var detail_win = detail_win_obj.getWindowByName("ig-detail_win", null);
	var reqObj = detail_win.reqObj;

	detail_win.document.getElementById("uniqID").value = reqObj.uniqID;
	detail_win.document.getElementById("pageNum").value = reqObj.pageNum;
	detail_win.document.getElementById("totLinkNum").value = reqObj.totLinkNum;
	detail_win.document.getElementById("curLinkNum").value = reqObj.curLinkNum;
	detail_win.document.getElementById("reqURL").value = reqObj.reqURL;
	detail_win.document.getElementById("regexp").value = reqObj.regexp;
	detail_win.document.getElementById("dirSave").value = reqObj.dirSave;
	detail_win.document.getElementById("readyState").value = reqObj.xmlhttp.readyState;
	try {
		detail_win.document.getElementById("statusText").value = reqObj.xmlhttp.statusText;
	}
	catch(e) { }
	detail_win.document.getElementById("responseText").value = reqObj.xmlhttp.responseText;
}


function launchFile() {	
	var igTree = document.getElementById("igTree");
	if (igTree.view.rowCount == 0) return;

	var idx = igTree.view.selection.currentIndex;
	var daNode = igTree.view.getItemAtIndex(idx);
	var shit = daNode.id;

	if (req_objs[shit].fileName == "") {
		alert(ihg_Globals.strings.no_file_to_open_yet);
		return;
	}

	var aLocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	aLocalFile.initWithPath(req_objs[shit].dirSave);
	aLocalFile.append(req_objs[shit].fileName);

	aLocalFile.launch();
}


function revealFile() {	
	var igTree = document.getElementById("igTree");
	if (igTree.view.rowCount == 0) return;

	var idx = igTree.view.selection.currentIndex;
	var daNode = igTree.view.getItemAtIndex(idx);
	var shit = daNode.id;

	var aLocalFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	aLocalFile.initWithPath(req_objs[shit].dirSave);
	aLocalFile.append(req_objs[shit].fileName);

	aLocalFile.reveal();
}


function setUpLinkedList() {
	var lastObj = req_objs.length - 1;

	for(var i = 0; i < req_objs.length; i++) {
		if (i == 0) req_objs[i].previousRequest = null;
		else req_objs[i].previousRequest = req_objs[i-1];

		if (i == lastObj) req_objs[i].nextRequest = null;
		else req_objs[i].nextRequest = req_objs[i+1];

		req_objs[i].firstRequest = req_objs[0];
		req_objs[i].lastRequest = req_objs[lastObj];

		req_objs[i].index = i;
	}
}


function openReqUrls() {
	var tree = document.getElementById("igTree");

	var nWinCheck=false;
	for (var i = 0; i < tree.view.rowCount; i++) {
		var reqUrl = req_objs[i].reqURL;
		if (tree.view.selection.isSelected(i)) {
			if (!nWinCheck) {
				var nWin = window.open(reqUrl,reqUrl,"menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes");
				nWinCheck = true;
			} else{
				var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
				win.openUILinkIn(reqUrl, 'tab');                                                                
			}
		}
	}
}


function doSelectAll() {
	var tree = document.getElementById("igTree");
	tree.view.selection.selectAll();
}


function doInvertSelection() {
	var tree = document.getElementById("igTree");

	//I can't make this working, don't know why...
	//tree.view.selection.invertSelection();
	//Firefox shows this error: NS_ERROR_NOT_IMPLEMENTED
	//This code should be equivalent:
	for (var i = 0; i < tree.view.rowCount; i++) {  
		tree.view.selection.toggleSelect(i);
	}
}


function setFocus() {
	var tree = document.getElementById("igTree");
	tree.focus();
	if (tree.view.rowCount > 0) tree.view.selection.select(0);
}


function exportList() {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);	
	fp.init(this.window, null, nsIFilePicker.modeSave);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterHTML);
	fp.filterIndex = 1;
	fp.defaultExtension = "html";

	var rv = fp.show();

	if (rv == nsIFilePicker.returnCancel) return;

	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	foStream.init(fp.file, 0x02 | 0x08 | 0x20, 0664, 0); // write only | create | truncate

	var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
	converter.init(foStream, "UTF-8", 0, 0);

	converter.writeString("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n"
	+ "<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" lang=\"en\">\n"
	+ "<head>\n"
	+ "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n"
	+ "<title>Links</title>\n"
	+ "</head>\n"
	+ "<body>\n");

	var tree = document.getElementById("igTree");

	for (var i = 0; i < tree.view.rowCount; i++) {
		var reqUrl = req_objs[i].reqURL;
		reqUrl = reqUrl.replace(/&/g, "&amp;");
		if (req_objs[i].regexp == "Embedded Image") converter.writeString("<img src=\"" + reqUrl + "\" alt=\"" + reqUrl+ "\" /><br />\n");
		else converter.writeString("<a href=\"" + reqUrl + "\">" + reqUrl + "</a><br />\n");
	}

	converter.writeString("</body>\n"
	+ "</html>\n");
	converter.close();
}
