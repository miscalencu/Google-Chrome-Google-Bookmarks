function Init()
	{
	GetBookmarks();
	}
	
function setBackgroudTimeout()
	{
	timeOut = window.setTimeout("Init();", 1000 * 60 * parseInt(localStorage.readTimeout));
	}