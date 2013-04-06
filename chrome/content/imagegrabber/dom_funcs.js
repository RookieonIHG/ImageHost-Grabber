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




/////////////////////////////    Used to get the links    /////////////////////////////
ihg_Functions.getLinks = function getLinks(sometext) {
	var myself = arguments.callee.name;
	ihg_Functions.LOG("Entering " + myself + "\n");

	var re;
	if (!ihg_Globals.downloadEmbeddedImages) re = new RegExp("<a\\b.+?>", "ig");
	else re = new RegExp("<(?:a|img)\\b.+?>", "ig");

	var filtered = sometext.replace(/\r?\n/g, " ");
	filtered = filtered.match(re);
	
	var theLinks = [];
	var caca = [];
	ihg_Functions.LOG("In " + myself + ", fixing to find the links.\n");
	
	for (var j = 0; j < filtered.length; j++) {
		if (filtered[j]) {
 			if (!ihg_Globals.downloadEmbeddedImages) theLinks[j] = filtered[j].match(/href\s*=\s*('|").+?\1/i);
            else theLinks[j] = filtered[j].match(/(?:href|src)\s*=\s*('|").+?\1/i);
			if (theLinks[j]) {
				var isEmbedded = (ihg_Globals.downloadEmbeddedImages && theLinks[j][0].match(/^src/i));
				theLinks[j] = theLinks[j][0].split(/(?:href|src)\s*=\s*/i);
				theLinks[j][1] = theLinks[j][1].replace(/["']/g, "");
				theLinks[j][1] = theLinks[j][1].replace(/&amp;/ig, '&');

				var url = theLinks[j][1];
				if (ihg_Globals.downloadEmbeddedImages && isEmbedded)
					url = "[embeddedImg]" + url;
				else 
					url = ihg_Functions.removeAnonymizer(url);
				caca.push(url);
			}
		}
	}
	ihg_Functions.LOG("In " + myself + ", caca is equal to: " + caca + "\n");	
	return caca;
}




////////////////////////////    Used to get an image source given the ID   /////////////////////////
ihg_Functions.getImgSrcById = function getImgSrcById(sometext, theID){
	var myself = arguments.callee.name;
	ihg_Functions.LOG("Entering " + myself + "\n");

	var re = new RegExp("<img\\b.+?>", "ig");
	var filtered = sometext.replace(/\r?\n/g, " ");
	filtered = filtered.match(re);

	var theLinks = new Array();
		
	var re = new RegExp("id\\s*=\\s*(\"|')?" + theID + "\\1[\\s>]");

	ihg_Functions.LOG("In " + myself + ", fixing to find the image.\n");
	if (filtered) {
		for (var j = 0; j < filtered.length; j++) {
			if (filtered[j]) {
				if (re.test(filtered[j])) {
					theLinks[j] = filtered[j].match(/src\s*=\s*("|')?(.+?)\1[\s>]/i);
					if (theLinks[j]) {
						var caca = theLinks[j][2].replace(/&amp;/ig, '&');
						}
					}
				}
			}
		}

	if(!caca) ihg_Functions.LOG("In " + myself + ", sometext is equal to: " + sometext + "\n");
	ihg_Functions.LOG("In " + myself + ", caca is equal to: " + caca + "\n");	
	return caca;
}





////////////////////////////    Used to get the frame tags    /////////////////////////
ihg_Functions.getFrameTags = function getFrameTags(sometext){
	var myself = arguments.callee.name;
	ihg_Functions.LOG("Entering " + myself + "\n");

	var re = new RegExp("<frame\\b.+?>", "ig");
	var filtered = sometext.replace(/\r?\n/g, " ");
	filtered = filtered.match(re);

	ihg_Functions.LOG("In " + myself + ", filtered is equal to: " + filtered + "\n");
	return filtered;
}




////////////////////////////    Used to get the image tags    /////////////////////////
ihg_Functions.getImgTags = function getImgTags(sometext){
	var myself = arguments.callee.name;
	ihg_Functions.LOG("Entering " + myself + "\n");

	var re = new RegExp("<img\\b.+?>", "ig");
	var filtered = sometext.replace(/\r?\n/g, " ");
	filtered = filtered.match(re);

	ihg_Functions.LOG("In " + myself + ", filtered is equal to: " + filtered + "\n");
	return filtered;
}



//////////////////   Gets the image source from an image tag /////////////////
ihg_Functions.getImgSrcFromTag = function getImgSrcFromTag(sometext){
	var myself = arguments.callee.name;
	ihg_Functions.LOG("Entering " + myself + "\n");

	var filtered = sometext;
	
	ihg_Functions.LOG("In " + myself + ", fixing to find the image.\n");
	if (filtered) {
		var theSrc = filtered.match(/src\s*=\s*("|')?(.+?)\1[\s>]/i);
		if (theSrc) {
			theSrc[2] = theSrc[2].replace(/&amp;/ig, '&');
		}
	}

	ihg_Functions.LOG("In " + myself + ", theSrc is equal to: " + theSrc + "\n");	
	if (theSrc) return theSrc[2];
	else return null;
}




///////////////////////////  Get the data in a <p> node  ///////////////////////////////
ihg_Functions.getPNodeData = function getPNodeData(sometext){
	var myself = arguments.callee.name;
	ihg_Functions.LOG("Entering " + myself + "\n");

	var re = new RegExp("<p>.+?</p>", "igm");
	var filtered = sometext.match(re);

	ihg_Functions.LOG("In " + myself + ", fixing to get the p nodes.\n");
	if(filtered) {
		for (var i=0; i < filtered.length; i++) {
			filtered[i] = filtered[i].replace("<p>", "");
			filtered[i] = filtered[i].replace("</p>", "");
			}
		}

	ihg_Functions.LOG("In " + myself + ", filtered is equal to: " + filtered + "\n");
	return filtered;
}
