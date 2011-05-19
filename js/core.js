var req = new XMLHttpRequest();
var bookmarks = new Array();
var lastReadDate = new Date();
var noLoggedIn = false;
var currentLabel = "";
var docXML;

function setDefaultVariables()
	{
	if(!localStorage.readTimeout)
		localStorage.readTimeout = "10";
		
	if(!localStorage.lastQuery)
		localStorage.lastQuery = "";

	if(!localStorage.showTotalBookmarks)
		localStorage.showTotalBookmarks = 1;

	if(!localStorage.showLabels)
		localStorage.showLabels = 1;
	}
	
function fillData() 
	{
  	if(req.readyState != 4)
		return;	

	if(req.responseXML != null)
		{
		docXML = req.responseXML.documentElement;
		var nodes = docXML.getElementsByTagName("bookmark");
		
		if(!nodes || nodes == null || nodes.length == 0)
			{
			}
		else
			{
			for (var i = 0; i < nodes.length; i++) 
				bookmarks[i] = GetInfo(nodes[i]);
				
			lastReadDate = new Date();

			setStorageData();
			updateBadge();	
			}
		noLoggedIn = false;
		}
	else
		{
		noLoggedIn = true;
		}
		
		switch(currentPage)
			{
			case "popup":
				ShowBookmarks("");
				break;
			case "options":
				break;
			case "background":
				setBackgroudTimeout();
				break;
			}
	}	
	
	
function GetBookmarks() 
	{
	bookmarks = new Array();
	var url = "http://www.google.com/bookmarks/?output=xml&num=10000";
	req.open("GET", url, true);
	req.onreadystatechange = fillData;
	req.send(null);
	}

function GetInfo(xmlnode)
	{
	var bookmarkObj = new Object();	
	bookmarkObj.url = xmlnode.getElementsByTagName("url")[0].firstChild.nodeValue;
	bookmarkObj.title = (xmlnode.getElementsByTagName("title")[0] != null)?(xmlnode.getElementsByTagName("title")[0].firstChild.nodeValue):bookmarkObj.url;
	bookmarkObj.timestamp = xmlnode.getElementsByTagName("timestamp")[0].firstChild.nodeValue;
	bookmarkObj.id = xmlnode.getElementsByTagName("id")[0].firstChild.nodeValue;
	
	var nodes = xmlnode.getElementsByTagName("label");
	var nrnodes = (!nodes || nodes == null || nodes.length == 0)?0:nodes.length;
	bookmarkObj.labels = new Array(nrnodes);
	for (var i = 0; i < nrnodes; i++)
		{
		bookmarkObj.labels[i] = nodes[i].firstChild.nodeValue;
		}

	var attributes = xmlnode.getElementsByTagName("attribute");
	bookmarkObj.favicon = "images/favicon.gif";
	var nrattributes = (!attributes || attributes == null || attributes.length == 0)?0:attributes.length;
	for (var i = 0; i < nrattributes; i++)
		{
		if(attributes[i].getElementsByTagName("name")[0] != null && attributes[i].getElementsByTagName("name")[0].firstChild.nodeValue == "favicon_url")
			{
			if(attributes[i].getElementsByTagName("value")[0] != null && attributes[i].getElementsByTagName("value")[0].firstChild != null)
				{
				bookmarkObj.favicon = attributes[i].getElementsByTagName("value")[0].firstChild.nodeValue;
				}
			}
		}

	return bookmarkObj;
	}

function GetLabels()
	{
	var labels = "";
	for(var i=0; i < bookmarks.length; i++)
		for(var j=0; j < bookmarks[i].labels.length; j++)
			{
			if(("|" + labels + "|").indexOf("|" + bookmarks[i].labels[j]  + "|") == -1)
				{
				if(labels != "")
					labels += "|";
				labels += bookmarks[i].labels[j].replace("|", "/");
				}
			}
	return labels;
	}

function FillBookmarks(label)
	{
	var ret = new Array();
	var total = 0;
	for(var i=0; i < bookmarks.length; i++)
		for(var j=0; j < bookmarks[i].labels.length; j++)
			if(bookmarks[i].labels[j].replace("|", "/") == label)
				{
				ret[total] = bookmarks[i];
				total ++;
				}
	return ret;
	}
	
function FillUnassignedBookmarks()
	{
	var ret = new Array();
	var total = 0;
	for(var i = 0; i < bookmarks.length; i++)
		if(bookmarks[i].labels.length == 0)
			{
			ret[total] = bookmarks[i];
			total ++;
			}
	return ret;
	}
	
	
function updateBadge()
	{
	if(!noLoggedIn)
		{
		if(localStorage.showTotalBookmarks == 1)
			{
			chrome.browserAction.setBadgeText({ text: String(bookmarks.length) });
			chrome.browserAction.setBadgeBackgroundColor({color:[0, 153, 204, 255]});
			}
		else
			{
			chrome.browserAction.setBadgeText({ text:"" });
			}

		chrome.browserAction.setTitle({title: "Total bookmarks: " + bookmarks.length + ".\nLast checked on: " + formatToLocalTimeDate(lastReadDate) });
		chrome.browserAction.setIcon({path: "images/icon_on.png" });
		}
	else
		{
		chrome.browserAction.setBadgeText({ text: "?" });
		chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 255]});
		chrome.browserAction.setTitle({title: "Not logged in!" });
		chrome.browserAction.setIcon({path: "images/icon.png" });
		}
	}	

function CompareNames(a, b)
	{
	var q = document.getElementById("query").value.toLowerCase();
	if(q == "") // sort by relevance - position of query
		return a.title.toLowerCase() > b.title.toLowerCase();
	else
		{
		if(a.title.toLowerCase().indexOf(q) != b.title.toLowerCase().indexOf(q))
			return parseInt(a.title.toLowerCase().indexOf(q)) - parseInt(b.title.toLowerCase().indexOf(q));
		else
			return a.title.toLowerCase() > b.title.toLowerCase();	
		}
	}
	
function CompareValues(a, b)
	{
	var q = document.getElementById("query").value.toLowerCase();
	if(q == "") // sort by relevance - position of query
		return a.toLowerCase() > b.toLowerCase();
	else
		{
		if(a.toLowerCase().indexOf(q) != b.toLowerCase().indexOf(q))
			return parseInt(a.toLowerCase().indexOf(q)) - parseInt(b.toLowerCase().indexOf(q));
		else
			return a.toLowerCase() > b.toLowerCase();
		}
	}

function showUrl(url)
	{
	chrome.tabs.create({url: url});
	}

function showPopup(url)
	{
	var add_bookmark_popup = window.open(url, "add_bookmark", "width=620,height=470");
	//add_bookmark_popup.moveTo(,0);
	}

function AddBookmark()
	{
	chrome.tabs.getSelected(null, fCallback);
	}

function fCallback(tab) 
	{
	//var a=window,b=document,c=encodeURIComponent,d=a.open("http://www.google.com/bookmarks/mark?op=edit&output=popup&bkmk="+c(b.location)+"&title="+c(b.title),"bkmk_popup","left="+((a.screenX||a.screenLeft)+10)+",top="+((a.screenY||a.screenTop)+10)+",height=420px,width=550px,resizable=1,alwaysRaised=1");a.setTimeout(function(){d.focus()},300);
	var a = window;
	b = document;
	c = encodeURIComponent;
	showPopup("http://www.google.com/bookmarks/mark?op=edit&output=popup&bkmk=" + c(tab.url) + "&title=" + c(tab.title));
	}

function setStorageData()
	{
	//localStorage.bookmarksData = bookmarks;
	localStorage.setObject("bookmarksData", bookmarks);
	localStorage.lastReadDate = lastReadDate;
	localStorage.noLoggedIn = noLoggedIn;
	localStorage.currentLabel = currentLabel;
	}

function getStorageData()
	{
	//bookmarks = localStorage.bookmarksData;
	bookmarks = localStorage.getObject("bookmarksData");	
	lastReadDate = new Date(localStorage.lastReadDate);
	noLoggedIn = (localStorage.noLoggedIn == "true");
	currentLabel = localStorage.currentLabel;
	}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
    return this.getItem(key) && JSON.parse(this.getItem(key));
}

// Format to local time from UTC
function formatToLocalTimeDate(inDate) 
	{
	return dateFormat(inDate, "ddd, d mmmm yyyy, h:MM:ss TT");
	}

setDefaultVariables();	
