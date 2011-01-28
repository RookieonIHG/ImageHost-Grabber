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




//////////////////////  Initialize the logFile Object  //////////////////////

ihg_Functions.initLogFile = function initLogFile() {
	var id = "{E4091D66-127C-11DB-903A-DE80D2EFDFE8}"; // imagegrabber's ID

	// This should work for Firefox v1.5+  It returns a file object initialized
	// with the path where the extension is located
	try {
		ihg_Globals.logFile = Components.classes["@mozilla.org/extensions/manager;1"]
	      	    .getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id); 
		}
	// For those who are still using the antiquated Firefox versions
	catch(e) {
		ihg_Globals.logFile = Components.classes["@mozilla.org/file/directory_service;1"]
			    .getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		ihg_Globals.logFile.append("extensions");
		ihg_Globals.logFile.append(id);
		}


	ihg_Globals.logFile.append("logs");

	// Create the logs directory if it's not already there
	if( !(ihg_Globals.logFile.exists()) )  ihg_Globals.logFile.create(1, 0755);

	ihg_Globals.logFile.append("log.txt");

	// Create the log file if it's not already there
	if( !(ihg_Globals.logFile.exists()) )  ihg_Globals.logFile.create(0, 0755);
	}



/****************************************************************************
 *	The following lines are the flags used for file-output.  These were
 *	taken from prio.h which can be found this at lxr.mozilla.org
 *	If you plan on changing anything with regards to the flags, you
 *	should read the comments in prio.h to undestand how these work.
 *
 *	613 #define PR_RDONLY       0x01
 *	614 #define PR_WRONLY       0x02
 *	615 #define PR_RDWR         0x04
 *	616 #define PR_CREATE_FILE  0x08
 *	617 #define PR_APPEND       0x10
 *	618 #define PR_TRUNCATE     0x20
 *	619 #define PR_SYNC         0x40
 *	620 #define PR_EXCL         0x80
 ***************************************************************************/


/////////////////  Dump to the log file (for Debug)  /////////////////////

ihg_Functions.LOG = function LOG( message ) {
	if(!ihg_Globals.debugOut) return;

	try {
		if(!ihg_Globals.logFile.path) ihg_Functions.initLogFile();
		}
	catch(e) {
		ihg_Functions.initLogFile();
		}

	var f_perms = 0755;  // this is ignored on windows
	var f_flags = 0x02 | 0x10;

	var the_date = String(Date()).split(" ");
	var dateForm = the_date[4] + " " + the_date[2] + " " + the_date[1] + " " + the_date[3];

	var outMessage = dateForm + "\t" + message;

	var count = outMessage.length;

	try {
		ihg_Globals.fileOut.init(ihg_Globals.logFile, f_flags, f_perms, null);
		}
	catch(e) {
		ihg_Globals.logFile.create(0, 0755);
		ihg_Globals.fileOut.init(ihg_Globals.logFile, f_flags, f_perms, null);
		}
		
	ihg_Globals.fileOut.write(outMessage, count);
	ihg_Globals.fileOut.close();
	}





//////////////  Dump to the log file (for Console)  ///////////////////

ihg_Functions.CON_LOG = function CON_LOG( message ) {
	if(!ihg_Globals.conLogOut) return;

	try {
		if(!ihg_Globals.logFile.path) ihg_Functions.initLogFile();
		}
	catch(e) {
		ihg_Functions.initLogFile();
		}

	var f_perms = 0755;  // this is ignored on windows
	var f_flags = 0x02 | 0x10;

	var the_date = String(Date()).split(" ");
	var dateForm = the_date[4] + " " + the_date[2] + " " + the_date[1] + " " + the_date[3];

	var outMessage = dateForm + "\t" + message;

	var count = outMessage.length;

	try {
		ihg_Globals.fileOut.init(ihg_Globals.logFile, f_flags, f_perms, null);
		}
	catch(e) {
		ihg_Globals.logFile.create(0, 0755);
		ihg_Globals.fileOut.init(ihg_Globals.logFile, f_flags, f_perms, null);
		}
		
	ihg_Globals.fileOut.write(outMessage, count);
	ihg_Globals.fileOut.close();
	}




/////////////////  Clears the log file    ///////////////////////

ihg_Functions.clearLog = function clearLog() {
	var f_perms = 0755;  // this is ignored on windows
	var f_flags = 0x02 | 0x20;

	try {
		if(!ihg_Globals.logFile.path) ihg_Functions.initLogFile();
		}
	catch(e) {
		ihg_Functions.initLogFile();
		}

	ihg_Globals.fileOut.init(ihg_Globals.logFile, f_flags, f_perms, null);

	ihg_Globals.fileOut.write("", 0);
	ihg_Globals.fileOut.close();

	alert(ihg_Globals.strings.debug_log_cleared);
	}





/////////////  Copys the log file to some location   //////////////

ihg_Functions.copyLog = function copyLog() {
	try {
		if(!ihg_Globals.logFile.path) ihg_Functions.initLogFile();
		}
	catch(e) {
		ihg_Functions.initLogFile();
		}

	var copyToDir = ihg_Functions.setDownloadDir(ihg_Globals.strings.pick_a_folder, null);

	if (!copyToDir) return;

	var newDir = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	newDir.initWithPath(copyToDir);

	try {
		ihg_Globals.logFile.copyTo(newDir, null);
		}
	catch(e) {
		alert(ihg_Globals.strings.failed_to_copy);
		return;
		}

	alert(ihg_Globals.strings.log_file_copied);
	}




/////////////////////  Get the console messages  ////////////////////

ihg_Functions.getConMsgs = function getConMsgs() {
	if(!ihg_Globals.conLogOut) return;

	var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

	var temp1 = new Object();
	var temp2 = new Object();

	consoleService.getMessageArray(temp1, temp2);
	var msgObj = temp1.value;

	consoleService.registerListener(ihg_Globals.consoleListener);

	for(var i=0; i < msgObj.length; i++) ihg_Functions.CON_LOG(msgObj[i].message + "\n");
	}



///////////////  Listener for the error console  /////////////////////

ihg_Globals.consoleListener = {
	observe : function(msgObj) { ihg_Functions.CON_LOG(msgObj.message + "\n"); }
	}
