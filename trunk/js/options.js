document.getElementById("showTotalBookmarks").checked = (localStorage.showTotalBookmarks == 1);
document.getElementById("showLabels").checked = (localStorage.showLabels == 1);
for(var i=0; i<document.getElementById("updateTimeout").length; i++)
	{
	if(localStorage.readTimeout == document.getElementById("updateTimeout")[i].value)
		{
		document.getElementById("updateTimeout")[i].selected = true;
		}
	}