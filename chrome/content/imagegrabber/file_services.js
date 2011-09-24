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




// CacheFileService constructor
//
// cacheFileID: a string representing the file

ihg_Functions.CacheFileService = function CacheFileService(cacheFileID) {
	if (!cacheFileID) throw "IHG error: cacheFileID is null in CacheFileService";

	var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
	ihg_Functions.LOG("Entering " + myself + "\n");

	var id = "{E4091D66-127C-11DB-903A-DE80D2EFDFE8}"; // imagegrabber's ID
	var cacheFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	// This should work for Firefox v1.5 to v3.6  It returns a file object initialized
	// with the path where the extension is located	
	try {
		var cacheFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		cacheFile = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id); 
	}

	// For the new 4.0 series
	catch (e) {
		var cacheFile =  Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		cacheFile.append("extensions");
		cacheFile.append(id);
	}
	
	cacheFile.append("cache");
	
	if(!cacheFile.exists()) cacheFile.create(1,0755);

	cacheFile.append(cacheFileID);

	this.cacheFile = cacheFile;
	this.fout = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

	this.SIS = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	}

ihg_Functions.CacheFileService.prototype = {
	writeCache : function cache_writeCache(someStuff, append_or_not) {	// set to false to overwrite; default is false
		if(!someStuff) throw "IHG error: someStuff is null in cache_writeCache";

		var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
		ihg_Functions.LOG("Entering " + myself + "\n");

		var f_perms = 0755;  // this is ignored on windows
		var f_flags = 0x02 | 0x08;

		if(append_or_not) f_flags |= 0x10;
		else f_flags |= 0x20;

		var count = someStuff.length;

		this.fout.init(this.cacheFile, f_flags, f_perms, null);
		
		this.fout.write(someStuff, count);
		this.fout.close();
	},

	getCache : function cache_getCache() {
		if( !this.cacheFile.exists() ) return null;

		var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
		ihg_Functions.LOG("Entering " + myself + "\n");

		var fileURI = ihg_Globals.ioService.newFileURI(this.cacheFile);
		var channel = ihg_Globals.ioService.newChannelFromURI(fileURI);

		var stream = channel.open();

		var count = stream.available();
		this.SIS.init(stream);
		var shitty = this.SIS.read(count);			

		return shitty;
		}
	}




ihg_Functions.forumStyleFileService = function forumStyleFileService() {
	var id = "{E4091D66-127C-11DB-903A-DE80D2EFDFE8}"; // imagegrabber's ID
	var forumStyleFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
	ihg_Functions.LOG("Entering " + myself + "\n");

	var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
	ihg_Functions.LOG("Entering " + myself + "\n");

	var id = "{E4091D66-127C-11DB-903A-DE80D2EFDFE8}"; // imagegrabber's ID

	// This should work for Firefox v1.5 to v3.6  It returns a file object initialized
	// with the path where the extension is located	
	try {
		var forumStyleFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		forumStyleFile = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id); 
	}

	// For the new 4.0 series
	catch (e) {
		var forumStyleFile =  Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		forumStyleFile.append("extensions");
		forumStyleFile.append(id);
	}
	
	forumStyleFile.append("forum_styles.xml");
	this.forumStyleFile = forumStyleFile;
	}


ihg_Functions.forumStyleFileService.prototype = {
	getForumStyles : function forum_getForumStyles() {
		if( !this.forumStyleFile.exists() ) return null;

		var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
		ihg_Functions.LOG("Entering " + myself + "\n");

		var fileURI = ihg_Globals.ioService.newFileURI(this.forumStyleFile);

		var req = new XMLHttpRequest();
		req.open("GET", fileURI.spec, false);
		req.send(null);
		
		return req.responseXML;
		}
	}

// The HostFileService class simply reads the data from the host file, then passes it along
// as a XML document that can be parsed with the DOM (Document Object Model).
// Check out https://developer.mozilla.org/En/DOM for a description of the DOM
ihg_Functions.HostFileService = function HostFileService() {
	var id = "{E4091D66-127C-11DB-903A-DE80D2EFDFE8}"; // imagegrabber's ID
	var hostFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	var hostf_servers = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
	ihg_Functions.LOG("Entering " + myself + "\n");

	if (ihg_Globals.hostFileLoc != "") {
		hostFile.initWithPath(ihg_Globals.hostFileLoc);
		var fuckwhore = hostFile.exists();
		if (!fuckwhore) ihg_Globals.hostFileLoc = "";
		}

	if (ihg_Globals.hostFileLoc == "") {
		// This should work for Firefox v1.5 to v3.6  It returns a file object initialized
		// with the path where the extension is located	
		try {
			var hostFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			hostFile = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id); 
		}

		// For the new 4.0 series
		catch (e) {
			var hostFile =  Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
			hostFile.append("extensions");
			hostFile.append(id);
		}
	
		hostFile.append("hostf.xml");
		}

	try {
		var hostf_servers = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		hostf_servers = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id); 
	}
	catch (e) {
		var hostf_servers =  Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		hostf_servers.append("extensions");
		hostf_servers.append(id);
	}
	
	hostf_servers.append("hostf_servers.xml");
	
	this.hostFile = hostFile;
	this.hostf_servers = hostf_servers;
	}


ihg_Functions.HostFileService.prototype = {
	getHosts : function host_getHosts() {
		if( !this.hostFile.exists() ) return null;

		var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
		ihg_Functions.LOG("Entering " + myself + "\n");

		var fileURI = ihg_Globals.ioService.newFileURI(this.hostFile);

		var req = new XMLHttpRequest();
		req.open("GET", fileURI.spec, false);
		req.send(null);
		
		return req.responseXML;
		},
		
	getHostf_servers : function host_getHostf_servers() {
		if( !this.hostf_servers.exists() ) return null;

		var fileURI = ihg_Globals.ioService.newFileURI(this.hostf_servers);

		var req = new XMLHttpRequest();
		req.open("GET", fileURI.spec, false);
		req.send(null);
		
		return req.responseXML;
		}
	}




ihg_Functions.dlWinCacheService = function dlWinCacheService(cacheFilePath) {
	if (!cacheFilePath) throw "IHG error: cacheFilePath is null in dlWinCacheService";

	var myself = String(arguments.callee).match(/(function.*)\(.*\)[\n\s]*{/m)[1];
	ihg_Functions.LOG("Entering " + myself + "\n");

	var cacheFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	cacheFile.initWithPath(cacheFilePath);
	
	this.cacheFile = cacheFile;
	}


ihg_Functions.dlWinCacheService.prototype = {
	writeCache : function dlWin_writeCache(req_objs) {
		var newDocument = Components.classes["@mozilla.org/xml/xml-document;1"].createInstance(Components.interfaces.nsIDOMXMLDocument);
		var newRoot = newDocument.createElement("root");


		for(var i = 0; i < req_objs.length; i++) { 
			var newReqObj = newDocument.createElement("reqObj");
			newReqObj.setAttribute("id", "req_" + i);

			for (var j in req_objs[i]) { 
				var x = typeof(req_objs[i][j]); 
				if ( (x != "object" && x != "function") || j == "regexp" ) {
					var newProp = newDocument.createElement("prop");
					newProp.setAttribute("id", j + "_" + i);
					newProp.setAttribute("type", x);

					if (req_objs[i][j].toString().match(/function/)) newProp.appendChild(newDocument.createCDATASection(req_objs[i][j]));
					else newProp.appendChild(newDocument.createTextNode(req_objs[i][j]));

					newReqObj.appendChild(newDocument.createTextNode("\n"));
					newReqObj.appendChild(newProp);
					//newReqObj.appendChild(newDocument.createTextNode("\n"));
					}
				}
			newReqObj.appendChild(newDocument.createTextNode("\n"));

			newRoot.appendChild(newDocument.createTextNode("\n")); 
			newRoot.appendChild(newReqObj); 
			newRoot.appendChild(newDocument.createTextNode("\n"));
			}

		newDocument.appendChild(newRoot);

		/* OLD CODE (version 1.6.5):
		var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist);
		persist.persistFlags = persist.PERSIST_FLAGS_NO_CONVERSION | persist.PERSIST_FLAGS_REPLACE_EXISTING_FILES | persist.PERSIST_FLAGS_BYPASS_CACHE;
		persist.saveDocument(newDocument, this.cacheFile, null, null, null, null);
		*/
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		foStream.init(this.cacheFile, 0x02 | 0x08 | 0x20, 0664, 0); // write only | create | truncate
		
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
		
		var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer);
		serializer.serializeToStream(newDocument, foStream, "UTF-8");
		
		converter.close(); 
	},

	getCache : function dlWin_getHosts() {
		if( !this.cacheFile.exists() ) return null;

		var fileURI = ihg_Globals.ioService.newFileURI(this.cacheFile);

		var req = new XMLHttpRequest();
		req.open("GET", fileURI.spec, false);
		req.send(null);
		
		return req.responseXML;
		}
	}
