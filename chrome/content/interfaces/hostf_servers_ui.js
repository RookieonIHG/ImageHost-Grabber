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


var hostf_servers_Globals = new Object();

hostf_servers_Globals.ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
hostf_servers_Globals.hosts = null;
hostf_servers_Globals.hFile = null;
hostf_servers_Globals.hostFileObj = null;

ihg_Globals.strbundle = document.getElementById("imagegrabber-strings");
ihg_Functions.read_locale_strings();


function HostFileService() {
	var id = "{E4091D66-127C-11DB-903A-DE80D2EFDFE8}"; // imagegrabber's ID
	var hostf_servers = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	// This should work for Firefox v1.5+  It returns a file object initialized
	// with the path where the extension is located
	try {
		hostf_servers = Components.classes["@mozilla.org/extensions/manager;1"]
      		    .getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id); 
		}
	// For those who are still using the antiquated Firefox versions
	catch(e) {
		hostf_servers = Components.classes["@mozilla.org/file/directory_service;1"]
			    .getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		hostf_servers.append("extensions");
		hostf_servers.append(id);
		}

	hostf_servers.append("hostf_servers.xml");

	this.hostf_servers = hostf_servers;
	}


HostFileService.prototype = {
	writeHosts : function cache_writeCache() {
		var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);
		persist.persistFlags = persist.PERSIST_FLAGS_NO_CONVERSION | persist.PERSIST_FLAGS_REPLACE_EXISTING_FILES | persist.PERSIST_FLAGS_BYPASS_CACHE;
		persist.saveDocument(hostf_servers_Globals.hFile, this.hostf_servers, null, null, null, null);
	},

	getHostf_servers : function() {
		if( !this.hostf_servers.exists() ) return null;

		var fileURI = hostf_servers_Globals.ioService.newFileURI(this.hostf_servers);

		var req = new XMLHttpRequest();
		req.open("GET", fileURI.spec, false);
		req.send(null);
		
		return req.responseXML;
		}

	}

/* 
function initWindow() {
	window.addEventListener("resize", resizeResponseTextBox, false);
	//resizeResponseTextBox();
	loadHostFile();
	}

function resizeResponseTextBox() {
	var rBoxThing = document.getElementById("tb_searchPattern");
	rBoxThing.height = window.innerHeight - 100;
	}
 */

function loadHostFile() {
	hostf_servers_Globals.hostFileObj = new HostFileService();
	hostf_servers_Globals.hFile = hostf_servers_Globals.hostFileObj.getHostf_servers();
	hostf_servers_Globals.hosts = hostf_servers_Globals.hFile.getElementsByTagName("server");

	var outBox = document.getElementById("tb_searchPattern");

	for (var i=0; i < hostf_servers_Globals.hosts.length; i++) {
		var someThing = outBox.appendItem(hostf_servers_Globals.hosts[i].textContent);
		someThing.setAttribute("ondblclick", "updateHFile();");
		}
	}

function updateHFile() {
	var tot = document.getElementById("tb_searchPattern");

	var tmpVal = prompt(ihg_Globals.strings.enter_host_file_server, tot.selectedItem.label); 
	if (!tmpVal) return;

	var sList = hostf_servers_Globals.hFile.firstChild.childNodes;

	for (var i=0; i<sList.length; i++) {
		if (sList[i].textContent == tot.selectedItem.label) sList[i].textContent = tmpVal;
		}

	tot.selectedItem.label = tmpVal;
	}

function addHostFServer() {
	var newHost = prompt(ihg_Globals.strings.new_host_file_server);
	if (!newHost) return;

	var tmp = hostf_servers_Globals.hFile.createElement("server");
	tmp.textContent = newHost;

	hostf_servers_Globals.hFile.firstChild.appendChild(tmp);
	hostf_servers_Globals.hFile.firstChild.appendChild(hostf_servers_Globals.hFile.createTextNode("\n"));

	var outBox = document.getElementById("tb_searchPattern");
	var someThing = outBox.appendItem(tmp.textContent);
	someThing.setAttribute("ondblclick", "updateHFile();");
	}

function delHostFServer() {
	var tot = document.getElementById("tb_searchPattern");
	if (!tot.selectedItem) return;
	
	for (var i=0; i<hostf_servers_Globals.hFile.firstChild.childNodes.length; i++) { 
		if (hostf_servers_Globals.hFile.firstChild.childNodes[i].textContent == tot.selectedItem.label) {
			hostf_servers_Globals.hFile.firstChild.removeChild(hostf_servers_Globals.hFile.firstChild.childNodes[i]);
			if (hostf_servers_Globals.hFile.firstChild.childNodes[i].textContent == "\n")
				hostf_servers_Globals.hFile.firstChild.removeChild(hostf_servers_Globals.hFile.firstChild.childNodes[i]);
			}
		}

	tot.removeItemAt(tot.selectedIndex);
	}

function updateHostFile() {
	hostf_servers_Globals.hostFileObj.writeHosts();
	}
