document.getElementById("showTotalBookmarks").checked = (localStorage.showTotalBookmarks == 1);
document.getElementById("showLabels").checked = (localStorage.showLabels == 1);
for(var i=0; i<document.getElementById("updateTimeout").length; i++)
	{
	if(localStorage.readTimeout == document.getElementById("updateTimeout")[i].value)
		{
		document.getElementById("updateTimeout")[i].selected = true;
		}
}

document.getElementById("updateTimeout").addEventListener("change", function () { localStorage.readTimeout = this[this.selectedIndex].value; });
document.getElementById("showTotalBookmarks").addEventListener("change", function () { localStorage.showTotalBookmarks = (this.checked ? 1 : 0); getStorageData(); updateBadge(); });
document.getElementById("showLabels").addEventListener("change", function () { localStorage.showLabels = (this.checked ? 1 : 0); });