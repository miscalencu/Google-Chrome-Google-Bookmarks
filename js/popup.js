var tm;
var currentPage = "popup";
var currentLabel = "";
var _labels = new Array();
var _bookmarks = new Array();
var q = "";

function ShowBookmarks(label) 
	{
	var content = "";
	var title = "";

	q = document.getElementById("query").value.toLowerCase();
	_labels = new Array();
	_bookmarks = new Array();
	currentLabel = "";

	if(noLoggedIn)
		{
		title = "You are not logged in!";
		content = "<a id=\"link_login\">Click here to log in.</a>"
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
				_labels = GetLabels().split("|").sort();
				}
			}
		else
			{
			title = label;
			_bookmarks = FillBookmarks(label).sort(CompareNames);
			content += "<img width=\"16\" height=\"16\" src=\"images/folder.gif\" alt=\"\" align=\"absmiddle\" /> <a id=\"link_root\" href=\"#\">...</a><br />";
			}
			
		for(var i=0; i < _labels.length; i++)
			if((q == "") || (_labels[i].toLowerCase().indexOf(q) != -1))
				content += "<img width=\"16\" height=\"16\" src=\"images/folder.gif\" alt=\"\" align=\"absmiddle\" /> <a href=\"#\" id=\"link_folder_" + i +"\">" + _labels[i] + "</a><br />";

		for(var i=0; i < _bookmarks.length; i++)
				if((q == "") || (_bookmarks[i].title.toLowerCase().indexOf(q) != -1))
					{
					content += "<img width=\"16\" height=\"16\" src=\"" + _bookmarks[i].favicon + "\" alt=\"\" align=\"absmiddle\" /> <a href=\"#\" id=\"link_url_" + i + "\" title=\"" + _bookmarks[i].url + "\">" + _bookmarks[i].title + "</a>";
					if(localStorage.showLabels == 1)
						{
						for(var j=0; j < _bookmarks[i].labels.length; j++)
							{
							content += "<table class=\"label\" cellpadding=\"0\" cellspacing=\"0\" valign=\"middle\">";
							content += "	<tr>";
							content += "		<td><img src=\"../images/left_edge.png\" /></td>";
							content += "		<td>";
							content += "			<a href=\"#\" id=\"link_label_" + i + "_" + j + "\" title=\"" + _bookmarks[i].labels[j] + "\">" + _bookmarks[i].labels[j] + "</a>";
							content += "		</td>";
							content += "		<td><img src=\"../images/right_edge.png\" /></td>";
							content += "	</tr>";
							content += "</table>";
							}
						}
					content += "<br />";
					}
		}

	document.getElementById("bookmarks").innerHTML = content;
	document.getElementById("title").innerHTML = title;	
	document.getElementById("footer").innerHTML = "<div class=\"footer\">Last read on: " + formatToLocalTimeDate(lastReadDate) + "</div>"

	currentLabel = label;
	localStorage.lastQuery = q;

	AddListenersOnBookmarks(noLoggedIn);
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

function Init()
	{
	getStorageData();
	document.getElementById("query").value = localStorage.lastQuery;
	ShowBookmarks("");
	document.getElementById("query").focus();
	}

function AddListenersOnBookmarks(noLoggedIn) {
	if(noLoggedIn) 
	{
		document.getElementById("link_login").addEventListener("click", function () { showUrl('http://www.google.com/bookmarks'); });
	}
	else 
	{
		if(document.getElementById("link_root") != null)
			document.getElementById("link_root").addEventListener("click", function () { ShowBookmarks(''); });

		for(var i=0; i < _labels.length; i++)
		{
			if((q == "") || (_labels[i].toLowerCase().indexOf(q) != -1))
			{
				document.getElementById("link_folder_" + i).addEventListener("click", function () { document.getElementById("query").value=""; ShowBookmarks(_labels[i]); });
			}
		}

		for(var i=0; i < _bookmarks.length; i++)
		{
			var link;
			var title;
			if((q == "") || (_bookmarks[i].title.toLowerCase().indexOf(q) != -1))
				{
				link = document.getElementById("link_url_" + i);
				title = link.title;
				link.addEventListener("click", function () { showUrl(this.title); });
				if(localStorage.showLabels == 1)
					{
					for(var j=0; j < _bookmarks[i].labels.length; j++)
						{
						link = document.getElementById("link_label_" + i + "_" + j);
						title = link.title;
						link.addEventListener("click", function () { javascript:document.getElementById("query").value="";ShowBookmarks(this.title); });
						}
					}
				}
		}

	}
}

function AddListeners() {
	document.getElementById("query").addEventListener("keyup", function () { ShowBookmarks(currentLabel); });
	document.getElementById("link_clear").addEventListener("click", function () { clearSearch(); });
	document.getElementById("link_add").addEventListener("click", function () { AddBookmark(); });
	document.getElementById("link_refresh").addEventListener("click", function () { refreshBookmarks(); });
	document.getElementById("link_goto").addEventListener("click", function () { showUrl('http://www.google.com/bookmarks'); });
}

AddListeners();
Init();