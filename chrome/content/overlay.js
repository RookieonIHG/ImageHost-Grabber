function ihg_contextMenuInit() {
	var ihg_contextMenu = document.getElementById("contentAreaContextMenu");
	if (ihg_contextMenu.state == 'open') return;
	
	if (window.gContextMenu == null) return;
	
	var isImg = gContextMenu.onImage;
	var isLnk = gContextMenu.onLink;
	
	document.getElementById("suck_sel_thread").hidden = !isLnk;
}