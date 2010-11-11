function Init()
	{
	GetBookmarks();
	setStorageData();
	}
	
function setBadge()
	{
	updateBadge();
	timeOut = window.setTimeout("Init();", pollInterval);
	}