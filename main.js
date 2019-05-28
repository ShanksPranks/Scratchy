// browserify main.js -o bundle.js

// npm libraries
var crypto = require('crypto');
const https = require('https');
let bsv = require('bsv');

//global variables
var allScratchyTransactions = [];
var allOP_RETURNs = [];
var allScratchPads = [];
var foundPad = false;
var event;
var payloadASM;
var delayInMilliseconds = 700; //0.7 second
var menuOpen = false;

// dom variables
var userHandle = document.getElementById('userHandle').value;
var scratchPad = document.getElementById("scratchPad").value;
var userPassword = document.getElementById('userPassword').value;
var userAddress = document.getElementById('addr').value;

// dom elements
var buttonGet = document.getElementById('getScratchPad');
var buttonSend = document.getElementById('sendScratchPad');
var pass = document.getElementById('pass');
var userHandleField = document.getElementById('userHandle');
var userPasswordField = document.getElementById('userPassword');
var scratchPadField = document.getElementById('scratchPad');
var menu = document.getElementById('menuButton');
var infoButton = document.getElementById('infoButton');
var eventList = document.getElementById('eventList');

var scratchyWindow = document.getElementsByClassName("scratchy");
var eventWindow = document.getElementsByClassName("pastevents");

// listeners
buttonGet.addEventListener('click', fetchTransactions);
buttonSend.addEventListener('click', encryptScratchPad);
userHandleField.addEventListener('change', updatePass);
userPasswordField.addEventListener('change', updatePass);
scratchPadField.addEventListener('change', updatePass);


document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.tooltipped');
  var instances = M.Tooltip.init(elems, {});
});
infoButton.addEventListener('click', showInfo);

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems, {});
});

eventList.addEventListener('click', showEvents);

$(document).ready(function(){
    $('.tabs').tabs();
  });

function getEvents() 
{
  console.log("getting evets..");
fetchDataGeneric("https://catship.co.za/scratchy/event_service_php/getEvents.php?tenseCode=0", populateAllEvents);

}

getEvents();

function populateAllEvents(dataIn) {
  var objIn = JSON.parse(dataIn);


    var x = document.getElementById("mySelect");

  
for(var propt in objIn){
  if (propt == "events")
  {
    console.log(objIn[propt]);
    objIn[propt].forEach(item => 
    {
        var option = document.createElement("option");
  option.text = item.eventName;
  x.add(option);
    }

      );
  }
  }

      var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems, {});

  
}

function hex2bin(hex) {
  var bytes = [],
    str;
  for (var i = 0; i < hex.length - 1; i += 2)
    bytes.push(parseInt(hex.substr(i, 2), 16));
  return String.fromCharCode.apply(String, bytes);
}

function encryptCustom(textIn, passwordIn) {
  var data = textIn;
  var password = passwordIn;
  var iv = '0000000000000000';
  var password_hash = crypto.createHash('sha256').update(password, 'utf8').digest('hex');
  var key = hex2bin(password_hash);
  password_hash = Buffer.alloc(32, key, "binary");
  var cipher = crypto.createCipheriv('aes-256-cbc', password_hash, iv);
  var encryptedData = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
  console.log('Base64 Encrypted:', encryptedData);
  return encryptedData;
}

//encryptCustom(myScratchPad, myEventPassword);

//encryptCustom("pereira", "d6F3Efeq");

//decryptCustom("79lHbSH8ikgXbMx9K+MoBQ==", "d6F3Efeq");

function decryptCustom(textIn, passwordIn) {
  var data = textIn;
  var password = passwordIn;
  var iv = '0000000000000000';
  var password_hash = crypto.createHash('sha256').update(password, 'utf8').digest('hex');
  var key = hex2bin(password_hash);
  password_hash = Buffer.alloc(32, key, "binary");
  var decipher = crypto.createDecipheriv('aes-256-cbc', password_hash, iv);
  var decryptedText = decipher.update(textIn, 'base64', 'utf8') + decipher.final('utf8');
  console.log('Decrypted Text:', decryptedText)
  return decryptedText;
}

function showInfo() {
  var elems = document.querySelectorAll('.tooltipped');
  var instance = M.Tooltip.getInstance(elems[0]);
  instance.open();
}

function showEvents() {
  var elems = document.querySelectorAll('select');
  var instance = M.FormSelect.getInstance(elems[0]);
  event = instance.getSelectedValues();
}



//uncomment for browserfy 
function buildMoneyButton() {
  const div = document.getElementById('my-money-button')
  moneyButton.render(div, {
    label: "POST TO BSV",
    outputs: [{
      type: "SCRIPT",
      script: payloadASM,
      amount: "0.0000",
      currency: "BSV"
    }, {
      to: userAddress,
      amount: "0.00001", // should this grow depending ont he size of the scracthpad?
      currency: "BSV"
    }]
  })
}

// re-fetch dom fields
function refreshValues() {
  userHandle = document.getElementById("userHandle").value;
  scratchPad = document.getElementById("scratchPad").value;
  userPassword = document.getElementById("userPassword").value;
  userAddress = document.getElementById("addr").value;
}

// this function sends the username to the brainwallet library to get the routing address
function updatePass() {
  refreshValues();
  document.getElementById("pass").value = userHandle;
  var event = new Event('change');
  pass.dispatchEvent(event);
}

// encrypt the scratch pad
function encryptScratchPad() {
  setTimeout(function() {

    refreshValues();
    var errorMessage = "";
    if (userPassword == "") {
      errorMessage = "please enter your password" + "\n"
    }
    if (userHandle == "") {
      errorMessage += "please enter your user name"
    }

    if (errorMessage !== "") {
      window.alert(errorMessage);
      return;
    }
    var encryptedScratchPad = encryptData(scratchPad);
    var payload = 'OP_RETURN ' + encryptedScratchPad;
    payloadASM = bsv.Script.buildDataOut(['scratchy.io', 'utf8', payload]).toASM();
    buildMoneyButton();

  }, delayInMilliseconds);
}

// decrypt the scratch pad
function decryptScratchPad(dataIn) {
  refreshValues();
  return decryptData(dataIn);
}

// generic encrypt 
function encryptData(dataIn) {
  var mykey = crypto.createCipher('aes-128-cbc', userPassword);
  var mystr = mykey.update(dataIn, 'utf8', 'hex');
  mystr += mykey.final('hex');
  return mystr;
}

// generic decrypt 
function decryptData(dataIn) {
  try {
    var mykey = crypto.createDecipher('aes-128-cbc', userPassword);
    var mystr = mykey.update(dataIn, 'hex', 'utf8')
    mystr += mykey.final('utf8');
    return mystr;
  } catch (err) {
    return ""
  }
}

// helper for fetching data from rest api using https
async function fetchDataGeneric(urlIn, functionIn) {
  https.get(urlIn, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      functionIn(data);
    });

  }).on('error', (e) => {
    console.error(e);
  });

}

// retrieves all transactions for user address
function fetchTransactions() {

allOP_RETURNs = [];
allScratchPads = [];

  setTimeout(function() {
   
      refreshValues();
      var errorMessage = "";
      if (userPassword == "") {
        errorMessage = "please enter your password!" + "\n"
      }
      if (userHandle == "") {
        errorMessage += "please enter your user name!"
      }

      if (errorMessage !== "") {
        window.alert(errorMessage);
        return;
      }
      //console.log("fetch transactions");
      document.getElementById("scratchPad").value = "";
      foundPad = false;
      var url = "https://api.blockchair.com/bitcoin-sv/dashboards/address/" + userAddress;
      fetchDataGeneric(url, populateAllTrans);
    },

    delayInMilliseconds);
}

// handler for parsing op return data from raw tx's
function populateAllTrans(dataIn) {
  var objIn = JSON.parse(dataIn);
  allScratchyTransactions = objIn["data"][userAddress]["transactions"];
  //console.log(allScratchyTransactions);
  allScratchyTransactions.forEach(getOPReturnData);

}

// cleans up op return data and populates scratchpad
function retrieveOP_RETURN(OP_RETURNIn) {
  var cleanScriptData = OP_RETURNIn.substring(OP_RETURNIn.indexOf("OP_RETURN ") + 10, OP_RETURNIn.length);
  allOP_RETURNs.push(cleanScriptData);
  var decryptedScript = decryptScratchPad(cleanScriptData);
  allScratchPads.push(decryptedScript);
  testScratchFound(decryptedScript);
  //
  if (allScratchyTransactions.length == allScratchPads.length)
    {
      for (var i = 0; i< allScratchyTransactions.length; i++)
      {
        if (allScratchPads[i] !== "") 
        {
        document.getElementById("scratchPad").value += i + ': ' + allScratchPads[i] + "\n";
        }
      }
    var myTextArea = document.getElementById("scratchPad");
    M.textareaAutoResize(myTextArea);
    myTextArea.focus();
    }
  
}

// uses bico to get op_return data
function getOPReturnData(value, index, array) {
  var url = "https://bico.media/" + value;
  fetchDataGeneric(url, retrieveOP_RETURN); // 1;
}

// will test if any op return data was found and decrypted successfully
function testScratchFound(decryptedScriptIn) {
  if (decryptedScriptIn !== "") {
    foundPad = true;
  }
}

