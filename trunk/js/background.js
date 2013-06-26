var currentPage = "background";

function Init()
	{
	GetBookmarks();
	}
	
function setBackgroudTimeout()
	{
	timeOut = window.setTimeout(function () { Init(); }, pollInterval);
	}

var pollInterval = 1000 * 60 * parseInt(localStorage.readTimeout);  // default 10 minutes
Init();