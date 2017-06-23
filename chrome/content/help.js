function buildContents() {
	for (var lnk of document.getElementById("Corpus").getElementsByTagName("a")) {
		if (lnk.name) {
			var ContentsElem = document.createElement("p");
			var ContentsLink = document.createElement("a");
			ContentsLink.href = "#" + lnk.name;
			ContentsLink.innerHTML = lnk.firstChild.textContent;
			ContentsElem.setAttribute("class", "MsoToc" + lnk.firstChild.tagName.match(/[hH](\d+)$/)[1]);
			ContentsElem.appendChild(ContentsLink);
			document.getElementById("Contents").appendChild(ContentsElem);
		}
	}
}