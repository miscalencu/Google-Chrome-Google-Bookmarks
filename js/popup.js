function ShowBookmarks() 
	{
	var content = "";
	for(var i=0; i < bookmarks.length; i++)
		{
		content += "<a href=\"javascript:showUrl('" + bookmarks[i].url + "')\">" + bookmarks[i].title + "</a><br />";
		}

	document.getElementById("bookmarks").innerHTML = content + "<div class=\"footer\">Last read on: " + lastReadDate.toGMTString() + "</div>";			
	//****************
	updateBadge();
	}

function showUrl(url)
{
	chrome.tabs.create({url: url});
}