function Init()
	{
	GetBookmarks();
	}
	
function setBadge()
	{
	updateBadge();
	timeOut = window.setTimeout("Init();", pollInterval);
	}