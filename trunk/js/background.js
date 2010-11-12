function Init()
	{
	GetBookmarks();
	}
	
function setBackgroudTimeout()
	{
	timeOut = window.setTimeout("Init();", pollInterval);
	}