var currentPage = "options";
$(document).ready(function () {
	$("#showTotalBookmarks").attr("checked", localStorage.showTotalBookmarks == 1);
	$("#showLabels").attr("checked", localStorage.showLabels == 1);
	$("#updateTimeout").val(localStorage.readTimeout);
	
	$("#updateTimeout").on("change", function () { localStorage.readTimeout = this[this.selectedIndex].value; });
	$("#showTotalBookmarks").on("change", function () { localStorage.showTotalBookmarks = (this.checked ? 1 : 0); getStorageData(); updateBadge(); });
	$("#showLabels").on("change", function () { localStorage.showLabels = (this.checked ? 1 : 0); });
});
