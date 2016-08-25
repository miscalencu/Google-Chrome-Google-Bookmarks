var tm;
var currentPage = "popup";
var _bookmarks = new Array();
var q = "";

function ShowPopupInfo() {
	var content = "";
	var title = "";

	_bookmarks = new Array();
	title = "Simple Google Bookmarks Sync";
	
	if (localStorage.noLoggedIn == "true") {
	    content = "<b>You are not logged in!</b><br />Click <a id=\"link_login\" href=\"#\">here to log in</a> or <a id=\"link_refresh\" href=\"#\">here to refresh</a>."
	    content += "<br />Go to <a id=\"link_options\" href=\"#\">options page</a> to setup the sync details.";
	}
	else {
	    content = "<b>You are logged in!</b><br />You have " + bookmarks.length + " bookmarks!";
	    content += "<br />Go to <a id=\"link_options\" href=\"#\">options page</a> to change the sync details.";
	}

	$("#bookmarks").html(content);
	$("#title").html(title);
	
	$("#footer").html("Last read on: " + formatToLocalTimeDate(localStorage.lastReadDate) + "<br />Last sync on: " + formatToLocalTimeDate(localStorage.lastSyncDate));

	AddListeners();
}

function AddListeners() {
    $("#link_refresh").on("click", function () { GetBookmarks(); });
    $("#link_options").on("click", function () { chrome.tabs.create({ url: chrome.extension.getURL('options.htm') }); });
    $("#link_login").on("click", function () { showUrl("http://www.google.com/bookmarks"); });
}

$(document).ready(function () {
    setDefaultVariables();
    getStorageData();
    ShowPopupInfo();
});

