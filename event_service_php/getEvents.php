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

$tenseCode = $_GET["tenseCode"];

$dateNow = date('Y-m-d', time());

$validEvents = [];

foreach ($eventsObject as $obby) {
    $start = DateTime::createFromFormat('Y-m-d', $obby["eventStartDate"])->format('Y-m-d');
    $end = DateTime::createFromFormat('Y-m-d', $obby["eventEndDate"])->format('Y-m-d');
   if ($dateNow >= $start &&  $dateNow <= $end )
    {
        array_push($validEvents,$obby);
    }
}

        http_response_code(200);
        $successObj = new \stdClass();
        $successObj->success =  'true';
        $successObj->message = 'Events retieved successfully';
        $successObj->events = $validEvents;

        print json_encode($successObj,JSON_PRETTY_PRINT);

}

catch(Exception $e) {

        $failObj = new \stdClass();
        $failObj->success =  'false';
        $failObj->message = $e->getMessage();
        $failObj->events = "";

        print json_encode($failObj,JSON_PRETTY_PRINT);
}


?>
