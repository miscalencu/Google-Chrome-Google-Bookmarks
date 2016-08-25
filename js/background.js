var currentPage = "background";
	
function setBackgroudTimeout()	{
    timeOut = window.setTimeout(function () { Init(); }, 1000 * 60);
}

function CheckForRefresh() {
    if (localStorage.lastSyncDate != null) {
        var diff = DateDiff(new Date(), new Date(localStorage.lastSyncDate)); // difference in seconds
        var timeout = localStorage.readTimeout; // timeout in minutes
        if (diff / 60 > timeout) {
            GetBookmarks();
        }
    }
    
    setBackgroudTimeout();
}

function DateDiff(date1, date2) {
    var datediff = date1.getTime() - date2.getTime(); //store the getTime diff - or +
    return (datediff / 1000); //Convert values to -/+ seconds and return value      
}

function Init() {
    getStorageData();
    updateBadge();
    CheckForRefresh();
}

$(document).ready(function () {
    Init();
});