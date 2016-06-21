var tm;
var currentPage = "popup";
var currentLabel = "";
var _labels = new Array();
var _bookmarks = new Array();
var q = "";

function ShowBookmarks(label) {
	var content = "";
	var title = "";

	q = $("#query").val().toLowerCase();
	_labels = new Array();
	_bookmarks = new Array();
	currentLabel = "";

	if (localStorage.noLoggedIn == "true") {
		title = "You are not logged in!";
		content = "<b>You are not logged in!</b><br /><br />Click <a id=\"link_login\" href=\"#\">here to log in</a> or <a id=\"link_refresh_in\" href=\"#\">here to refresh</a>."
	}
	else {
		if (label == "") {
			title = "All bookmarks";
			if (q == "") {
				_bookmarks = FillUnassignedBookmarks().sort(CompareNames);
				_labels = GetLabels().split("|").sort();
			}
			else {
				_bookmarks = bookmarks.sort(CompareNames); // search in all bookmarks in home page
				_labels = GetLabels().split("|").sort();
			}
		}
		else {
			title = label;
			_labels = new Array();
			_bookmarks = FillBookmarks(label).sort(CompareNames);
			content += "<i class=\"fa fa-folder-open-o fa-lg\" title=\"\" style=\"vertical-align:middle; color: black; line-height: 18px\" /> <a id=\"link_root\" href=\"#\">...</a><br />";
		}

		for (var i = 0; i < _labels.length; i++)
			if ((q == "") || (_labels[i].toLowerCase().indexOf(q) != -1))
				content += "<i class=\"fa fa-folder-o fa-lg\" title=\"\" style=\"vertical-align:middle; color: black; line-height: 18px\" /> <a title=\"" + _labels[i] + "\" href=\"#\" id=\"link_folder_" + i + "\">" + _labels[i] + "</a><br />";

		for (var i = 0; i < _bookmarks.length; i++)
			if ((q == "") || (_bookmarks[i].title.toLowerCase().indexOf(q) != -1)) {
				content += "<img width=\"16\" height=\"16\" src=\"" + _bookmarks[i].favicon + "\" alt=\"\" align=\"absmiddle\" /> <a href=\"#\" id=\"link_url_" + i + "\" title=\"" + _bookmarks[i].url + "\">" + _bookmarks[i].title + "</a>";
				if (localStorage.showLabels == 1) {
					for (var j = 0; j < _bookmarks[i].labels.length; j++) {
						content += "<a href=\"#\" class=\"label\" id=\"link_label_" + i + "_" + j + "\" title=\"" + _bookmarks[i].labels[j] + "\">" + _bookmarks[i].labels[j] + "</a>";
					}
				}
				content += "<br />";
			}
	}

	$("#bookmarks").html(content);
	$("#title").html(title);
	
	if(lastReadDate != null) {
		$("#footer").html("Last read on: " + formatToLocalTimeDate(lastReadDate));
	}

	currentLabel = label;
	localStorage.lastQuery = q;

	AddListenersOnBookmarks(localStorage.noLoggedIn == "true");
}
	
function clearSearch() {
	$("#query").val("");
	ShowBookmarks(currentLabel);
	$("#query").focus();
}

function refreshBookmarks() {
	GetBookmarks();
}

function Init() {
	getStorageData();
	$("#query").val(localStorage.lastQuery);
	ShowBookmarks("");
	$("#query").focus();
}

function AddListenersOnBookmarks(noLoggedIn) {
	if (noLoggedIn) {
		$("#link_login").on("click", function () { showUrl('http://www.google.com/bookmarks'); });
		$("#link_refresh_in").on("click", function () { refreshBookmarks(); });
	}
	else {
		if ($("#link_root").length > 0)
			$("#link_root").on("click", function () { ShowBookmarks(""); });

		for (var i = 0; i < _labels.length; i++) {
			if ((q == "") || (_labels[i].toLowerCase().indexOf(q) != -1)) {
				$("#link_folder_" + i).on("click", function () { $("#query").val(""); ShowBookmarks(this.title); });
			}
		}

		for (var i = 0; i < _bookmarks.length; i++) {
			if ((q == "") || (_bookmarks[i].title.toLowerCase().indexOf(q) != -1)) {
				link = $("#link_url_" + i);
				$(link).on("click", function () { showUrl(this.title); });
				if (localStorage.showLabels == 1) {
					for (var j = 0; j < _bookmarks[i].labels.length; j++) {
						$("#link_label_" + i + "_" + j).on("click", function () { $("#query").value = ""; ShowBookmarks(this.title); });
					}
				}
			}
		}

	}
}

function AddListeners() {
	$("#query").on("keyup", function () { ShowBookmarks(currentLabel); });
	$("#link_clear").on("click", function () { clearSearch(); });
	$("#link_add").on("click", function () { AddBookmark(); });
	$("#link_refresh").on("click", function () { refreshBookmarks(); });
	$("#link_goto").on("click", function () { showUrl("http://www.google.com/bookmarks"); });
}

$(document).ready(function () {
	AddListeners();
	Init();
});

