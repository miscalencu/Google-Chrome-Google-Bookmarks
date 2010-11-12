var tm;

function ShowBookmarks(label) 
	{
	var content = "";
	var title = "";
	var q = document.getElementById("query").value.toLowerCase();
	
	var _bookmarks = new Array();
	var _labels = new Array()

	if(noLoggedIn)
		{
		title = "You are not logged in!";
		content = "<a href=\"javascript:showUrl('http://www.google.com/bookmarks')\">Click here to log in.</a>"
		}
	else
		{
		if(label == "")
			{
			title = "All bookmarks";
			_labels = GetLabels().split("|");
			if(q == "")
				{
				_bookmarks = FillUnassignedBookmarks().sort(CompareNames);
				_labels = GetLabels().split("|").sort();
				}
			else
				{
				_bookmarks = bookmarks.sort(CompareNames); // search in all bookmarks in home page
				_labels = GetLabels().split("|").sort(CompareValues);
				}
			}
		else
			{
			title = label;
			_bookmarks = FillBookmarks(label).sort(CompareNames);
			content += "<img width=\"16\" height=\"16\" src=\"images/folder.gif\" alt=\"\" align=\"absmiddle\" /> <a href=\"javascript:ShowBookmarks('')\">...</a><br />";
			}
			
		for(var i=0; i < _labels.length; i++)
			if((q == "") || (_labels[i].toLowerCase().indexOf(q) != -1))
				content += "<img width=\"16\" height=\"16\" src=\"images/folder.gif\" alt=\"\" align=\"absmiddle\" /> <a href=\"javascript:document.getElementById('query').value=''; ShowBookmarks('" + _labels[i] + "')\">" + _labels[i] + "</a><br />";

		for(var i=0; i < _bookmarks.length; i++)
				if((q == "") || (_bookmarks[i].title.toLowerCase().indexOf(q) != -1))
					content += "<img width=\"16\" height=\"16\" src=\"" + _bookmarks[i].favicon + "\" alt=\"\" align=\"absmiddle\" /> <a href=\"javascript:showUrl('" + _bookmarks[i].url + "')\">" + _bookmarks[i].title + "</a><br />";
		}

	document.getElementById("bookmarks").innerHTML = content;
	document.getElementById("title").innerHTML = title;	
	document.getElementById("footer").innerHTML = "<div class=\"footer\">Last read on: " + lastReadDate.toGMTString() + "</div>"

	currentLabel = label;
	localStorage.lastQuery = q;
	}
	
function clearSearch()
	{
	document.getElementById("query").value = "";
	ShowBookmarks(currentLabel);
	document.getElementById("query").focus();
	}	

function refreshBookmarks()
	{
	GetBookmarks();
	}