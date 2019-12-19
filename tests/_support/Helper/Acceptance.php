<?php
namespace Helper;

// here you can define custom actions
// all public methods declared in helper class will be available in $I

class Acceptance extends \Codeception\Module
{
	function getJsLog() 
	{
	    $wb = $this->getModule("WebDriver");
	    $logs = $wb->webDriver->manage()->getLog("browser");
	    return $logs;
	}
}
