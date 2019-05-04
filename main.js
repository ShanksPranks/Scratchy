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
var eventSelectList;
var event;
var userHandle = "";
var scratchPad;
var userPassword = "";
var payloadASM;
var buttonGet = document.getElementById('getScratchPad'); 
buttonGet.addEventListener('click', fetchTransactions);
var buttonSend = document.getElementById('sendScratchPad'); 
buttonSend.addEventListener('click', encryptScratchPad);
//scratchPad = document.getElementById('scratchPad'); 
//scratchPad.addEventListener('change', encryptScratchPad);


 //uncomment for browserfy 
 function buildMoneyButton()
 {
  const div = document.getElementById('my-money-button')
  moneyButton.render(div, {
  	label: "POST TO BSV",
    outputs: [{
      type: "SCRIPT",
      script: payloadASM,
      amount: "0.0000",
      currency: "BSV"
    },
    {
      to: "1ScraTcivKYpoSbjoY8qig7hf87iWZexg",
      amount: "0.00001",
      currency: "BSV"
    }
    ]
  })
}

// fetch dom fields
function refreshValues()
{
//eventSelectList = document.getElementById("eventSelectList");
//event =  eventSelectList.options[eventSelectList.selectedIndex].text;
userHandle = document.getElementById("userHandle").value;
scratchPad = document.getElementById("scratchPad").value;
userPassword = document.getElementById("userPassword").value;
}

// for testing
/*
var eventSelectList = 'none';
var userHandle = 'shankspranks';
var scratchPad = '';
var userPassword = 'Dogfish10';
*/


function encryptScratchPad()
{
	refreshValues();
	var errorMessage = "";
	if (userPassword == "")
	{
	errorMessage = "please enter your password"+"\n"
    }
	if (userHandle == "")
	{
	errorMessage += "please enter your user name"
    }
    
    if (errorMessage !== "")
    {
    window.alert(errorMessage);
    return;
	}
	var encryptedScratchPad = encryptData(scratchPad);
	var payload = 'OP_RETURN '+encryptedScratchPad;
    payloadASM = bsv.Script.buildDataOut(['scratchy.io', 'utf8', payload]).toASM();
    console.log(payloadASM);
    buildMoneyButton();
}


function decryptScratchPad(dataIn)
{
	refreshValues();
	return decryptData(dataIn);
}

function encryptData(dataIn)
{
var passCombo = userPassword+userHandle;
var mykey = crypto.createCipher('aes-128-cbc', passCombo);
var mystr = mykey.update(dataIn, 'utf8', 'hex');
mystr += mykey.final('hex');
return mystr;
}

function decryptData(dataIn)
{
try
{
var passCombo = userPassword+userHandle;
var mykey = crypto.createDecipher('aes-128-cbc', passCombo);
var mystr = mykey.update(dataIn, 'hex', 'utf8')
mystr += mykey.final('utf8');
return mystr;
}
  catch(err) {
  	return ""
  	}
}

// helper for fetching data from rest api using https
function fetchDataGeneric(urlIn, functionIn)
{
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

function populateAllTrans(dataIn)
{
	var objIn = JSON.parse(dataIn);
	allScratchyTransactions = objIn["data"]["1ScraTcivKYpoSbjoY8qig7hf87iWZexg"]["transactions"]; 
	allScratchyTransactions.forEach(getOPReturnData);

}

function fetchTransactions()
{
	refreshValues();
	var errorMessage = "";
	if (userPassword == "")
	{
	errorMessage = "please enter your password!"+"\n"
    }
	if (userHandle == "")
	{
	errorMessage += "please enter your user name!"
    }
    
    if (errorMessage !== "")
    {
    window.alert(errorMessage);
    return;
	}
	console.log("fetch transactions");
	document.getElementById("scratchPad").value = "";
	foundPad = false;
	var url =  "https://api.blockchair.com/bitcoin-sv/dashboards/address/1ScraTcivKYpoSbjoY8qig7hf87iWZexg";
    fetchDataGeneric(url, populateAllTrans);
}

function retrieveOP_RETURN(OP_RETURNIn)
{
	   var cleanScriptData = OP_RETURNIn.substring(OP_RETURNIn.indexOf("OP_RETURN ")+ 10, OP_RETURNIn.length);
  	   allOP_RETURNs.push(cleanScriptData);
  	   var decryptedScript = decryptScratchPad(cleanScriptData);
  	   allScratchPads.push(decryptedScript);
  	   testScratchFound(decryptedScript);
  		if (decryptedScript !== "")
  		{
  		document.getElementById("scratchPad").value += decryptedScript + "\n";
  		var myTextArea = document.getElementById("scratchPad");
  		M.textareaAutoResize(myTextArea);
  		myTextArea.focus();
  	    }
}

// uses bico to get op_return data
function getOPReturnData(value, index, array) {
  var url = "https://bico.media/" + value;
  fetchDataGeneric(url, retrieveOP_RETURN);
}

function testScratchFound(decryptedScriptIn)
{
	if (decryptedScriptIn !== "")
	{
		foundPad = true; 
	}
}

// tests 

//fetchTransactions();

