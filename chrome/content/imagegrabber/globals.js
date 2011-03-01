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




///////////////////////////   Global Variables ////////////////////////////////
var ihg_Globals = new Object();
var ihg_Functions = new Object();

ihg_Globals.appName = "ImageHost Grabber";

ihg_Globals.strbundle = null;
ihg_Globals.strings = new Object();

ihg_Globals.ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
ihg_Globals.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
ihg_Globals.fileOut = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
ihg_Globals.logFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

ihg_Globals.AUTO_RENAME = null;
ihg_Globals.fileExistsBehavior = null;
ihg_Globals.prefix_fileNames = null;
ihg_Globals.prefix_directories = null;

ihg_Globals.remove_duplicate_links = null;
ihg_Globals.remove_duplicate_links_across_pages = null;

ihg_Globals.maxThreads = null;

ihg_Globals.maxRetries = null;
ihg_Globals.reqTimeout = null;

ihg_Globals.baseDirSave = null;

ihg_Globals.firstPage = null;
ihg_Globals.lastPage = null;

ihg_Globals.suckMode = null;

ihg_Globals.showDLDir = null;
ihg_Globals.lastDLDir = null;

ihg_Globals.lastSessionDir = null;

ihg_Globals.debugOut = null;
ihg_Globals.conLogOut = null;

ihg_Globals.createDocTitSF = null;
ihg_Globals.docTitle = null;
ihg_Globals.createPageDirs = null;

ihg_Globals.hostFileLoc = null;
ihg_Globals.hosts_list = null;
ihg_Globals.unknownHosts_list = new Array();
ihg_Globals.exceptions_list = null;

ihg_Globals.downloadEmbeddedImages = null;
ihg_Globals.minEmbeddedHeight = null;
ihg_Globals.minEmbeddedWidth = null;
ihg_Globals.minFileSize = null;

ihg_Globals.cacheDLWin = null;

ihg_Globals.lastHost = { hostID : null, maxThreads : null, urlPattern : null , searchPattern : null };

ihg_Globals.hostfAutoUpdate = null;
ihg_Globals.hostfUpdateConfirm = null;
ihg_Globals.hostfMergeBehavior = null;

ihg_Globals.closeInterval = null;
ihg_Globals.closeCountdown = null;

ihg_Globals.autoCloseWindow = null;

ihg_Globals.useLastModFromHeader = null;