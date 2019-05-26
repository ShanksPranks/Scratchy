<?php
// restfull API end point where user posts the new valid event

http_response_code(500);

// error logging
ini_set("log_errors", 1);
ini_set("error_log", "php-error.log");

try {

// open the current events database and load it into an array
$eventFileName = "db/events.json";
// file head fake
if (!file_exists($eventFileName)) {
    $file = fopen($eventFileName, "w");
    fclose($file);
}
$eventFile = fopen($eventFileName, "r+") or die("Unable to open file!");
$eventFileString = file_get_contents($eventFileName);
$eventsObject = json_decode($eventFileString, true); // make a json object
fclose($eventFile);


foreach ($eventsObject as $obby) {
   if ($_POST["eventName"] == $obby["eventName"])
    {
        throw new Exception("Event name already exists, please choose a unique event name.", 1);
    }
}

// get the event object being posted to the API 
$myObj = new \stdClass();
$myObj->eventID = count($eventsObject) + 1; // get the highest id of the events object 
$myObj->eventName =  $_POST["eventName"];
$myObj->eventPassword =  $_POST["eventPassword"];
$myObj->eventStartDate=  $_POST["eventStartDate"];
$myObj->eventEndDate=  $_POST["eventEndDate"];
$eventObject       = $myObj; 

// add the event object to the arrray
if (empty($eventsObject)) {
    $eventsObject = array(
        $eventObject
    );
} else {
    array_push($eventsObject, $eventObject);
}
;

// turn object back into string
$eventFileString = json_encode($eventsObject);
$eventFile = fopen($eventFileName, "w") or die("Unable to open file!");
// write and close the file
fwrite($eventFile, $eventFileString);
fclose($eventFile);

        http_response_code(200);
        $successObj = new \stdClass();
$successObj->success =  'true';
$successObj->message = 'Event added successfully';
$successObj->event = $myObj->eventName;

        print json_encode($successObj,JSON_PRETTY_PRINT);

}

catch(Exception $e) {

$failObj = new \stdClass();
$failObj->success =  'false';
$failObj->message = $e->getMessage();
$failObj->encryptedScratchPad = "";
        print json_encode($failObj,JSON_PRETTY_PRINT);
}


?>
