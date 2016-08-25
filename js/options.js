var currentPage = "options";
var currentFolders = [];

$(document).ready(function () {
    FillChromeFolders($("#updateFolder"));

	$("#showTotalBookmarks").attr("checked", localStorage.showTotalBookmarks == 1);
	$("#updateTimeout").val(localStorage.readTimeout);
	$("#removeExisting").attr("checked", localStorage.removeExisting == 1);
	$("#uniqueBookmarks").attr("checked", localStorage.uniqueBookmarks == 1);
	$("#prefixLabels").attr("checked", localStorage.prefixLabels == 1);
	$("#skipLabels").attr("checked", localStorage.skipLabels == 1);
	
	$("#updateTimeout").on("change", function () { localStorage.readTimeout = this[this.selectedIndex].value; });
	$("#showTotalBookmarks").on("change", function () { localStorage.showTotalBookmarks = (this.checked ? 1 : 0); getStorageData(); updateBadge(); });
	$("#removeExisting").on("change", function () { localStorage.removeExisting = (this.checked ? 1 : 0); });
	$("#uniqueBookmarks").on("change", function () { localStorage.uniqueBookmarks = (this.checked ? 1 : 0); });
	$("#prefixLabels").on("change", function () { localStorage.prefixLabels = (this.checked ? 1 : 0); });
	$("#suffixNotes").on("change", function () { localStorage.suffixNotes = (this.checked ? 1 : 0); });
	$("#skipLabels").on("change", function () { localStorage.skipLabels = (this.checked ? 1 : 0); });

	$("#updateFolder").on("change", function () { localStorage.currentFolder = this[this.selectedIndex].value; });

	$("#newFolder").on("click", function () {
	    var parentID = $("#updateFolder").val();
	    if (parentID === "0") {
	        alert("Please choose a parent folder first from the \"Folder\" list!");
	        return;
	    }

	    var folderName = prompt("Please type in folder name: ");
	    if (folderName != "") {
	        chrome.bookmarks.create({
	            'parentId': parentID,
	            'title': folderName
	        }, function (newitem) {
	            localStorage.currentFolder = newitem.id;
	            FillChromeFolders($("#updateFolder"));
	        });
	    }
	});

	$("#btnSync").on("click", function () {
	    if ($(this).data("generating") === "1") {
	        alert("Please wait for the data to finish syncing!");
	        return;
	    }

	    var ret = SyncBookmarks(function () {
	        FillChromeFolders($("#updateFolder"));
	        $("#btnSync").data("generating", "0").find(".fa").removeClass("fa-spin");
	        alert("Synchronization successful!");
	    });

	    if (ret != "OK") {
	        alert(ret);
	    } else {
	        $("#btnSync").data("generating", "1").find(".fa").addClass("fa-spin");
	    }
	});

	GetBookmarks();
	
	$('a.glyphicon, [data-toggle="tooltip"]').tooltip();
});

function FillInBookmarksInfo() {

    var content = "";
    if (localStorage.noLoggedIn == "true") {
        content = "<b>You are not logged in!</b> Click <a href=\"http://www.google.com/bookmarks\" target=\"_blank\">here to log in</a> or <a id=\"link_refresh_in\" href=\"#\">here to refresh</a>."
    }
    else {
        content = "You have " + bookmarks.length + " bookmarks. <a href=\"http://www.google.com/bookmarks\" target=\"_blank\" style=\"text-decoration:none; padding-left: 10px;\"><i class=\"fa fa-link\"></i> View</a>";
    }

    $("#bookmarksInfo").html(content);
    $("#link_refresh_in").on("click", function () {
        GetBookmarks();
    });
}

function FillChromeFolders(selectObj) {
    // clear first
    $(selectObj).find('option').remove();

    chrome.bookmarks.getTree(function (result) {
        $.each($(result).attr("children"), function (index) {
            var id = $(this).attr("id");
            var title = $(this).attr("title");
            currentFolders.push({ id: id, title: title, level: 0 });
            ProcessChromeFolders($(this).attr("children"), 0);
        })

        $("<option></option>").attr("value", "0").text("- Please select one -").appendTo(selectObj);
        $.each(currentFolders, function () {
            var folder = $(this);
            var title = Array($(folder).attr("level") + 1).join("\u00A0\u00A0\u00A0") + $(folder).attr("title");
            
            $("<option></option>").attr("value", $(folder).attr("id")).text(title).appendTo(selectObj);
        });

        $(selectObj).val(localStorage.currentFolder);
    });
}

function ProcessChromeFolders(children, level) {
    level++;
    $.each(children, function (index) {
        if ($(this).attr("url") == undefined) {
            var id = $(this).attr("id");
            var title = $(this).attr("title");
            currentFolders.push({ id: id, title: title, level: level });
            ProcessChromeFolders($(this).attr("children"), level);
        }
    });
}
