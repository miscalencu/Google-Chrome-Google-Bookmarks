var bookmarks = new Array();
var docXML;

var isExtension = (typeof chrome.browserAction !== "undefined");
var debugEnabled = !('update_url' in chrome.runtime.getManifest());

if (!debugEnabled) {
    console.log = function () { };
}

function setDefaultVariables() {
    if (!localStorage.currentFolder)
        localStorage.currentFolder = 0;

    if (!localStorage.uniqueBookmarks)
        localStorage.uniqueBookmarks = 1;

	if (!localStorage.readTimeout)
	    localStorage.readTimeout = 1440;

	if (!localStorage.removeExisting)
	    localStorage.removeExisting = 0;

	if (!localStorage.prefixLabels)
	    localStorage.prefixLabels = 0;

	if (!localStorage.skipLabels)
	    localStorage.skipLabels = 0;

	if (!localStorage.showTotalBookmarks)
		localStorage.showTotalBookmarks = 1;
	
	if (!localStorage.lastReadDate)
	    localStorage.lastReadDate = null;

	if (!localStorage.lastSyncDate)
	    localStorage.lastSyncDate = null;
	
	if (!localStorage.noLoggedIn)
		localStorage.noLoggedIn = true;
}
	
function fillData(result) {
	if (result != null) {
		docXML = result.documentElement;
		var $nodes = $(docXML).find("bookmark");
		localStorage.noLoggedIn = "false";

		if ($nodes.length == 0) {
		}
		else {
			for (var i = 0; i < $nodes.length; i++)
				bookmarks[i] = GetInfo($nodes[i]);

			localStorage.lastReadDate = new Date();
			setStorageData();
		}
	}
	else {
		localStorage.noLoggedIn = "true";
	}
	
	updateBadge();

	switch (currentPage) {
		case "popup":
			ShowPopupInfo();
			break;
	    case "options":
	        FillInBookmarksInfo();
			break;
	    case "background":
	        SyncBookmarks();
			break;
	}
}

function SyncBookmarks(callback) {
    var currentFolder = localStorage.currentFolder;
    if (currentFolder === "0") {
        console.log("Your sync folder is not setup!");
        return "Your sync folder is not setup!";
    }

    if (localStorage.noLoggedIn == "true") {
        console.log("You are not logged in!");
        return "You are not logged in!";
    }

    try {
        // check if I need to remove first
        if (localStorage.removeExisting == "1") {
            chrome.bookmarks.getChildren(currentFolder, function (results) {
                if (results.length > 0) {
                    SyncRemoveExisting(results, function () {
                        console.log("Folders removing is done!");
                        SyncBookmark(0, currentFolder, function () {
                            console.log("[1] Bookmarks sync is done!");
                            localStorage.lastSyncDate = new Date();
                            if (typeof (callback) == "function") {
                                callback();
                            }
                        });
                    });
                } else {
                    console.log("No need for folders removing!");
                    SyncBookmark(0, currentFolder, function () {
                        console.log("[2] Bookmarks sync is done!");
                        localStorage.lastSyncDate = new Date();
                        if (typeof (callback) == "function") {
                            callback();
                        }
                    });
                }
            });
        } else {
            SyncBookmark(0, currentFolder, function () {
                console.log("[3] Bookmarks sync is done!");
                localStorage.lastSyncDate = new Date();
                if (typeof (callback) == "function") {
                    callback();
                }
            });
        }
    }
    catch (err) {
        console.log("Error: " + err.message);
        return "Error: " + err.message;
    }

    return "OK";
}

function SyncRemoveExisting(children, callback) {
    if (children.length == 0) {
        if (typeof(callback) == "function") {
            callback();
        }
        return;
    }

    var bookmark = children[0];

    if (bookmark.url == null) {
        console.log("Removing folder '" + bookmark.title + "' ...");
        chrome.bookmarks.removeTree(bookmark.id, function () {
            SyncRemoveExisting(children.slice(1), callback);
        });
    }
    else {
        console.log("Removing bookmark '" + bookmark.title + "' ...");
        chrome.bookmarks.remove(bookmark.id, function () {
            SyncRemoveExisting(children.slice(1), callback);
        });
    }
}

function SyncBookmark(lastIndex, currentFolder, callback) {
    if (lastIndex > bookmarks.length - 1) {
        if (typeof (callback) == "function") {
            callback();
        }
        return;
    }

    console.log("Sync bookmark index " + lastIndex);
    var bookmark = bookmarks[lastIndex];

    // sync labels first
    if (localStorage.skipLabels == "0" && bookmark.labels.length > 0) {

        var labels = bookmark.labels;
        if (localStorage.uniqueBookmarks) {
            labels = labels.slice(0, 1);
        }

        SyncLabels(labels, currentFolder, function () {
            console.log("Labels sync for '" + bookmark.url + "' is done...");
            SyncBookmarkLink(currentFolder, bookmark, labels, function () {
                console.log("Link sync for '" + bookmark.url + "' is done...");
                SyncBookmark(lastIndex + 1, currentFolder, callback);
            });
        });
    } else {
        SyncBookmarkLink(currentFolder, bookmark, ["ROOT"], function () {
            console.log("Link sync for '" + bookmark.url + "' is done...");
            SyncBookmark(lastIndex + 1, currentFolder, callback);
        });
    }
}

function SyncLabels(labels, currentFolder, callback) {
    if (labels.length == 0) {
        if (typeof (callback) == "function") {
            callback();
        }
        return;
    }

    var label = labels[0];

    chrome.bookmarks.getChildren(currentFolder, function (children) {
        var results = $.grep($(children), function (item) { return (item.title == label && item.url == null); });
        if (results.length == 0) {
            // non-existing folder

            // decide the possition assuming all existing are alphabetically ordered
            var index = -1;
            for (var i = 0; i < children.length; i++) {
                if (children[i].title > label) {
                    index = i;
                    break;
                }
            }

            if (index == -1)
                index = children.length;

            chrome.bookmarks.create({ 'title': label, 'parentId': currentFolder, 'index':index }, function () {
                console.log("creating folder '" + label + "' done ...")
                SyncLabels(labels.slice(1), currentFolder, callback);
            });
        }
        else {
            // existing folder
            SyncLabels(labels.slice(1), currentFolder, callback);
        }
    });
}

function SyncBookmarkLink(parentId, bookmark, subfolders, callback) {
    if (subfolders.length == 0) {
        if (typeof (callback) == "function")
        {
            callback();
        }
        return;
    }

    var subfolder = subfolders[0];
    var title = bookmark.title;

    if (localStorage.prefixLabels == 1) {
        title = " " + title;
        for (var i = 0; i < bookmark.labels.length; i++) {
            title = "[" + bookmark.labels[i] + "]" + title;
        }
    }

    if (subfolder == "ROOT") {
        chrome.bookmarks.getChildren(parentId, function (children) {

            var existing = $.grep($(children), function (item) { return (item.title == title) && (item.url == bookmark.url); });
            if (existing.length == 0) {
                // decide the possition assuming all existing are alphabetically ordered
                var index = -1;
                for (var i = 0; i < children.length; i++) {
                    if (children[i].title > title.trim()) {
                        index = i;
                        break;
                    }
                }

                if (index == -1)
                    index = children.length;

                chrome.bookmarks.create({ 'title': title, 'url': bookmark.url, 'parentId': parentId, 'index': index }, function () {
                    console.log("Link '" + bookmark.url + "' for '" + subfolder + "' done ...");
                    SyncBookmarkLink(parentId, bookmark, subfolders.slice(1), callback);
                });
            } else {
                console.log("Skip adding link '" + bookmark.url + "' to folder '" + subfolder + "' ...");
                SyncBookmarkLink(parentId, bookmark, subfolders.slice(1), callback);
            }
        });
    }
    else {
        chrome.bookmarks.getSubTree(parentId, function (tree) {
            var results = $.grep($(tree[0].children), function (item) { return (item.title == subfolder) && (item.url == null); });
            if (results.length == 0) {
                // non-existing folder
                console.log("Error: cannot find folder '" + subfolders[0] + "'!");
            }
            else {
                var _parent = results[0];
                var existing = $.grep($(_parent.children), function (item) { return (item.title == title) && (item.url == bookmark.url); });
                if (existing.length == 0) {

                    // decide the possition assuming all existing are alphabetically ordered
                    var index = -1;
                    for (var i = 0; i < _parent.children.length; i++) {
                        if (_parent.children[i].title > title) {
                            index = i;
                            break;
                        }
                    }

                    if (index == -1)
                        index = _parent.children.length;

                    chrome.bookmarks.create({ 'title': title, 'url': bookmark.url, 'parentId': _parent.id, 'index': index }, function () {
                        console.log("Link '" + bookmark.url + "' for '" + subfolder + "' done ...");
                        SyncBookmarkLink(parentId, bookmark, subfolders.slice(1), callback);
                    });
                }
                else {
                    console.log("Skip adding link '" + bookmark.url + "' to folder '" + subfolder + "' ...");
                    SyncBookmarkLink(parentId, bookmark, subfolders.slice(1), callback);
                }
            }
        });
    };

    console.log("Sync link " + bookmark.url + " for parent " + parentId + " done ...");
}
	
function GetBookmarks() {
	bookmarks = new Array();
	console.log("starting https ajax call ...");

	if (currentPage == "popup") {
		$("#bookmarks").html("Please wait. Reloading data ... <i class=\"fa fa-spin fa-spinner fa-lg\"></i>");
	}
	
	$.ajax({
		url: "https://www.google.com/bookmarks/",
		data: "output=xml&num=10000",
		beforeSend: function (request) {
			request.setRequestHeader("Content-Type", "text/xml");
		},
		success: function (result) {
			console.log("success fired ...");
			fillData(result);
		},
		error: function (jqXHR, textStatus, err) {
			console.log("fail fired ...");
			fillData(null); // now it goes here if not logged in
			// alert("Error: " + err);
		}
	});
}

function GetInfo(xmlnode) {
	var $xmlnode = $(xmlnode);
	var bookmarkObj = {};
	bookmarkObj.url = $xmlnode.find("url").text();
	bookmarkObj.title = ($xmlnode.find("title").length > 0) ? $xmlnode.find("title").text() : bookmarkObj.url;
	bookmarkObj.timestamp = $xmlnode.find("timestamp").text();
	bookmarkObj.id = $xmlnode.find("id").text();

	var $nodes = $xmlnode.find("label");
	bookmarkObj.labels = [];
	for (var i = 0; i < $nodes.length; i++) {
		bookmarkObj.labels.push($($nodes[i]).html());
	}

	//bookmarkObj.favicon = "images/favicon.gif";

	// REMOVED because it can cause BLOCKED issue (ex: see http://www.htc-club.ro/favicon.ico)
	//var $attributes = $xmlnode.find("attribute");
	//$.each($attributes, function () {
	//	if ($(this).find("name").text() == "favicon_url") {
	//		bookmarkObj.favicon = $(this).find("value").text();
	//		return;
	//	}
	//});
	
	//if (bookmarkObj.favicon == "images/favicon.gif") // default favicon
		bookmarkObj.favicon = "https://www.google.com/s2/u/0/favicons?domain=" + ExtractDomain(bookmarkObj.url);

	return bookmarkObj;
}

function GetLabels() {
	var labels = "";
	for (var i = 0; i < bookmarks.length; i++)
		for (var j = 0; j < bookmarks[i].labels.length; j++) {
			if (("|" + labels + "|").indexOf("|" + bookmarks[i].labels[j] + "|") == -1) {
				if (labels != "")
					labels += "|";
				labels += bookmarks[i].labels[j].replace("|", "/");
			}
		}
	return labels;
}

function FillBookmarks(label) {
	var ret = new Array();
	var total = 0;
	for (var i = 0; i < bookmarks.length; i++)
		for (var j = 0; j < bookmarks[i].labels.length; j++)
			if (bookmarks[i].labels[j].replace("|", "/") == label) {
				ret[total] = bookmarks[i];
				total++;
			}
	return ret;
}
	
function FillUnassignedBookmarks() {
	var ret = new Array();
	var total = 0;
	for (var i = 0; i < bookmarks.length; i++)
		if (bookmarks[i].labels.length == 0) {
			ret[total] = bookmarks[i];
			total++;
		}
	return ret;
}
	
function ExtractDomain(url) {
	url = url.toLowerCase();
	url = url.replace("http://", "");
	url = url.replace("https://", "");
	url = url.replace("ftp://", "");
	return url.split("/")[0];
}

function updateBadge() {
	if (localStorage.noLoggedIn == "false") {
		if (localStorage.showTotalBookmarks == 1) {
			chrome.browserAction.setBadgeText({ text: String(bookmarks.length) });
			chrome.browserAction.setBadgeBackgroundColor({ color: [0, 153, 204, 255] });
		}
		else {
			chrome.browserAction.setBadgeText({ text: "" });
		}

		chrome.browserAction.setTitle({ title: "Total bookmarks: " + bookmarks.length + ".\nLast read on: " + formatToLocalTimeDate(localStorage.lastReadDate) + ".\nLast sync on: " + formatToLocalTimeDate(localStorage.lastSyncDate) });
		chrome.browserAction.setIcon({ path: "images/icon_on.png" });
	}
	else {
		chrome.browserAction.setBadgeText({ text: "?" });
		chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
		chrome.browserAction.setTitle({ title: "Not logged in!" });
		chrome.browserAction.setIcon({ path: "images/icon.png" });
	}
}

function CompareNames(a, b) {
	var titlea = Trim(a.title.toLowerCase());
	var titleb = Trim(b.title.toLowerCase());

	var q = Trim($("#query").val().toLowerCase());
	if (q == "") // sort by relevance - position of query
		return (titlea < titleb) ? -1 : 1;
	else {
		if (titlea.indexOf(q) != titleb.indexOf(q)) {
			var inda = parseInt(titlea.indexOf(q));
			var indb = parseInt(titleb.indexOf(q));
			inda = (inda == -1) ? 10000 : inda;
			indb = (indb == -1) ? 10000 : indb;
			return (inda < indb) ? -1 : 1;
		}
		else
			return (titlea < titleb) ? -1 : 1;
	}
}
	
function showUrl(url) {
	chrome.tabs.create({ url: url });
}

function showPopup(url) {
	var add_bookmark_popup = window.open(url, "add_bookmark", "width=620,height=470");
	//add_bookmark_popup.moveTo(,0);
}

function AddBookmark() {
	chrome.tabs.getSelected(null, fCallback);
}

function fCallback(tab) {
	var a = window;
	b = document;
	c = encodeURIComponent;
	showPopup("https://www.google.com/bookmarks/mark?op=edit&output=popup&bkmk=" + c(tab.url) + "&title=" + c(tab.title));
}

function setStorageData() {
	localStorage.setObject("bookmarksData", bookmarks);
}

function getStorageData() {
	bookmarks = localStorage.getObject("bookmarksData");
}

Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
	return this.getItem(key) && JSON.parse(this.getItem(key));
}

// Format to local time from UTC
function formatToLocalTimeDate(inDate) {
    if (isNaN(Date.parse(inDate))) {
        return "N/A";
    }
    else {
        return dateFormat(inDate, "ddd, d mmmm yyyy, h:MM:ss TT");
    }
}

function Trim(str) {
	return str.replace(/^\s+|\s+$/g, '');
}

$(document).ready(function () {
	setDefaultVariables();
});