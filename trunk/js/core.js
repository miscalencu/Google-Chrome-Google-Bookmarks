var req = new XMLHttpRequest();
var bookmarks = new Array();
var lastReadDate = new Date();
var timeOut;

function setDefaultVariables()
	{
	if(!localStorage.readTimeout)
		localStorage.readTimeout = "10";
	}
	
function fillData() 
	{
  	if(req.readyState != 4)
		return;	

	var docXML = req.responseXML;
  	var nodes = docXML.getElementsByTagName("bookmarks");
  	
  	if(!nodes || nodes == null || nodes.length == 0)
  		{
  		}
  	else
  		{
	  	nodes = docXML.getElementsByTagName("bookmark");
		bookmarks = new Array(nodes.length);
	  	for (var i = 0; i < nodes.length; i++) 
			bookmarks[i] = GetInfo(nodes[i]);

		lastReadDate = new Date();
		}
		
		switch(currentPage)
			{
			case "popup":
				ShowBookmarks();
				break;
			case "options":
				break;
			case "background":
				setBadge();
				break;
			}
	}	
	
	
function GetBookmarks() 
	{
	bookmarks = new Array();
	
	req.open("GET", "http://www.google.com/bookmarks/?output=xml&num=1000");
	req.onreadystatechange = fillData;
	req.send(null);
	}

function GetInfo(xmlnode)
	{
	var bookmarkObj = new Object();	
	bookmarkObj.title = xmlnode.getElementsByTagName("title")[0].firstChild.nodeValue;
	bookmarkObj.url = xmlnode.getElementsByTagName("url")[0].firstChild.nodeValue;
	bookmarkObj.timestamp = xmlnode.getElementsByTagName("timestamp")[0].firstChild.nodeValue;
	bookmarkObj.id = xmlnode.getElementsByTagName("timestamp")[0].firstChild.nodeValue;

	return bookmarkObj;
	}
	
function updateBadge()
	{
	timeOut = null;
	
	//chrome.browserAction.setBadgeText({ text: "?" });
	//chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 255]});
	//chrome.browserAction.setTitle({title: "No location defined!\nClick here to set a new location!" });
	//chrome.browserAction.setIcon({path: "images/icon.png" });
	}	

setDefaultVariables();	
