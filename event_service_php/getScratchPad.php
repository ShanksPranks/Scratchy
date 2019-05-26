<?php
// restfull API end point where user does a get to encrypt their scratch pad

http_response_code(500);

// error logging
ini_set("log_errors", 1);
ini_set("error_log", "php-error.log");

function encrypt(string $data, string $key, string $method): string
{
  $iv = "0000000000000000";
  $encrypted = openssl_encrypt($data, $method, $key, OPENSSL_RAW_DATA, $iv);
  $encrypted = base64_encode($encrypted);
  return $encrypted;
}

function decrypt(string $data, string $key, string $method): string
{
  $data = base64_decode($data);
  $iv = "0000000000000000";
  $data = openssl_decrypt($data, $method, $key, OPENSSL_RAW_DATA,$iv);
  return $data;
}

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


//get the users data
$data = $_GET["scratchPad"];
$eventID = $_GET["eventID"];
$eventPassword = "Ba,djgf w8";

// loop through the event database to get the password
foreach ($eventsObject as $obby) {
   if ($_GET["eventID"] == $obby["eventID"])
    {
        $eventPassword = $obby["eventPassword"];
    }
}

if ($eventPassword == "Ba,djgf w8")
{
    throw new Exception("Event password not found.", 1);
}

// encrypt the users scracth pad
$password = $eventPassword ;
$method = 'AES-256-CBC';
// simple password hash
$key = hex2bin(substr(hash('sha256', $password),0,64));
$encryptedScratchPad = encrypt($data, $key, $method);

// lets return the json object
$myObj = new \stdClass();
$myObj->success =  'true';
$myObj->message = 'ScratchPad encrypted successfully';
$myObj->encryptedScratchPad = $encryptedScratchPad;

        http_response_code(200);
        print json_encode($myObj,JSON_PRETTY_PRINT);

}

catch(Exception $e) {

$failObj = new \stdClass();
$failObj->success =  'false';
$failObj->message = $e->getMessage();
$failObj->encryptedScratchPad = "";

        print json_encode($failObj,JSON_PRETTY_PRINT);
}




?>