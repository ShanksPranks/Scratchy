<?php

ini_set("log_errors", 1);
ini_set("error_log", "php-error.log");

// end point where user posts the new valid transaction
$catShipTransaction       = $_POST["jsonObject"];
$catShipTransactionObject = json_decode($catShipTransaction, true); // make a json object
// there is no need to validate the new transaction server side as peers will validate

// get the existing transaction pool
$catShipTransactionPoolFileName = "../json/catShipTransactionPool.json";


// do a head fake to create this fiel if it doesent exist because php doesent have a read/write, create if not exists
if (!file_exists($catShipTransactionPoolFileName)) {
    $file = fopen($catShipTransactionPoolFileName, "w");
    fclose($file);
}

$catShipTransactionPoolFile = fopen($catShipTransactionPoolFileName, "r+") or die("Unable to open file!");

$catShipTransactionPoolString = file_get_contents($catShipTransactionPoolFileName);
$catShipTransactionPoolObject = json_decode($catShipTransactionPoolString, true); // make a json object
fclose($catShipTransactionPoolFile);

if (empty($catShipTransactionPoolObject)) {
    //error_log("file object was null");
    //error_log($catShipTransactionPoolObject[0]["senderAddress"]);
    $catShipTransactionPoolObject = array(
        $catShipTransactionObject
    );
} else {
    //error_log("file object was not null, pushing");
    //error_log($catShipTransactionPoolObject[0]["senderAddress"]);
    array_push($catShipTransactionPoolObject, $catShipTransactionObject);
}
;

// turn object back into string
$catShipTransactionPoolString = json_encode($catShipTransactionPoolObject);
$catShipTransactionPoolFile = fopen($catShipTransactionPoolFileName, "w") or die("Unable to open file!");

// write and close the file
fwrite($catShipTransactionPoolFile, $catShipTransactionPoolString);
fclose($catShipTransactionPoolFile);


?>