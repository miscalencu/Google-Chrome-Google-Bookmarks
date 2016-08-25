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
		content = "<b>You are not logged in!</b><br />Click <a id=\"link_login\" href=\"#\">here to log in</a> or <a id=\"link_refresh_in\" href=\"#\">here to refresh</a>."
	}
	else {
	    content = "<b>You are logged in!</b><br />You have " + bookmarks.length + " bookmarks!";
	}

	$("#bookmarks").html(content);
	$("#title").html(title);
	
	$("#footer").html("Last read on: " + formatToLocalTimeDate(localStorage.lastReadDate) + "<br />Last sync on: " + formatToLocalTimeDate(localStorage.lastSyncDate));

	AddListeners();
}

function AddListeners() {
    $("#link_refresh_in").on("click", function () { GetBookmarks(); });
    $("#link_login").on("click", function () { showUrl("http://www.google.com/bookmarks"); });
}

$(document).ready(function () {
    getStorageData();
    ShowPopupInfo();
});

