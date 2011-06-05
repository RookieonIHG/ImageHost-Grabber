function isThread(Url) {
	var forumStyleFileObj = new ihg_Functions.forumStyleFileService();
	var fsFile = forumStyleFileObj.getForumStyles();
	var forums = fsFile.getElementsByTagName("forum");
	
	for (var i = 0; i < forums.length; i++) {
		var uPatNode = forums[i].getElementsByTagName("urlpattern")[0];
		var uPat = new RegExp(uPatNode.textContent);
		if (Url.match(uPat)) return true;
	}
}

function ihg_contextMenuInit() {
	var ihg_contextMenu = document.getElementById("contentAreaContextMenu");
	if (ihg_contextMenu.state == 'open') return;
	
	if (window.gContextMenu == null) return;
	
	var isImg = gContextMenu.onImage;
	var isLnk = gContextMenu.onLink;
	
	document.getElementById("suck_sel_thread").hidden = !(isLnk && isThread(content.document.activeElement.href));
}