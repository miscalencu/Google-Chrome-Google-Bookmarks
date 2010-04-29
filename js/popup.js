function ShowBookmarks(label) 
	{
	var content = "";
	var title = "";

	if(noLoggedIn)
		{
		title = "You are not logged in!";
		content = "<a href=\"javascript:showUrl('http://www.google.com/bookmarks')\">Click here to log in.</a>"
		}
	else
		{
		if(label == "")
			{
			var labels = GetLabels().split("|").sort();
			for(var i=0; i < labels.length; i++)
				{
				content += "<img width=\"16\" height=\"16\" src=\"images/folder.gif\" alt=\"\" align=\"absmiddle\" /> <a href=\"javascript:ShowBookmarks('" + labels[i] + "')\">" + labels[i] + "</a><br />";
				}
			title = "All bookmarks";
			}
		else
			{
			title = label;
			content += "<img width=\"16\" height=\"16\" src=\"images/folder.gif\" alt=\"\" align=\"absmiddle\" /> <a href=\"javascript:ShowBookmarks('')\">...</a><br />";
			}
		var _bookmarks;
		if(label == "")
			_bookmarks = bookmarks.sort(CompareNames);
		else
			_bookmarks = FillBookmarks(label).sort(CompareNames);

		for(var i=0; i < _bookmarks.length; i++)
			{
			if(_bookmarks[i].labels.length == 0 || (label != ""))
				content += "<img width=\"16\" height=\"16\" src=\"" + _bookmarks[i].favicon + "\" alt=\"\" align=\"absmiddle\" /> <a href=\"javascript:showUrl('" + _bookmarks[i].url + "')\">" + _bookmarks[i].title + "</a><br />";
			}	
		content += "<img width=\"16\" height=\"16\" src=\"images/add.gif\" alt=\"\" align=\"absmiddle\" /> <a href=\"javascript:AddBookmark()\">Add bookmark...</a><br />";
		}

	document.getElementById("bookmarks").innerHTML = content;
	document.getElementById("title").innerHTML = title;	
	document.getElementById("footer").innerHTML = "<div class=\"footer\">Last read on: " + lastReadDate.toGMTString() + "</div>"

	updateBadge();
	}