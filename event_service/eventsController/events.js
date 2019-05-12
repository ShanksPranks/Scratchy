/* eslint-disable class-methods-use-this */
//import db from '../db/event_db';
//import dbs from '../db/event_dbS';
var eventPath = '../event_service/db/events.json';

var db;

var fs = require('fs');

/*
fs.open('../event_service/db/events.json', 'r', function (err, file) {
  if (err) throw err;
  console.log('Saved!');
});
*/

fs.readFile(eventPath, function(err, data) {
    console.log(data.toString());
    db = JSON.parse(data);
  });

// npm libraries
var crypto = require('crypto');

// gl0bals 
var myEventPassword = "";
var myEventID = 0;
var myScratchPad = "";

function hex2bin(hex)
{
  var bytes = [], str;
  for(var i=0; i< hex.length-1; i+=2)
    bytes.push(parseInt(hex.substr(i, 2), 16));
  return String.fromCharCode.apply(String, bytes);
}

function encryptCustom(textIn, passwordIn) {
var data = textIn;
var password = passwordIn;
var iv = '0000000000000000';
var password_hash = crypto.createHash('sha256').update(password,'utf8').digest('hex');
var key = hex2bin(password_hash);
password_hash = Buffer.alloc(32,key,"binary");
var cipher = crypto.createCipheriv('aes-256-cbc', password_hash, iv);
var encryptedData = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
console.log('Base64 Encrypted:', encryptedData);
return encryptedData;
}

function decryptCustom(textIn, passwordIn) {
var data = textIn;
var password = passwordIn;
var iv = '0000000000000000';
var password_hash = crypto.createHash('sha256').update(password,'utf8').digest('hex');
var key = hex2bin(password_hash);
password_hash = Buffer.alloc(32,key,"binary");
var decipher = crypto.createDecipheriv('aes-256-cbc', password_hash, iv);
var decryptedText = decipher.update(encryptedData, 'base64', 'utf8') + decipher.final('utf8');
//console.log('Decrypted Text:', decryptedText)
return decryptedText;
}


// generic encrypt 
function encryptData(dataIn, passwordIn)
{
  if ((dataIn == "") || (passwordIn == ""))
  {
  return "ERROR";
  }
var mykey = crypto.createCipher('aes-128-cbc', passwordIn);
var mystr = mykey.update(dataIn, 'utf8', 'hex');
mystr += mykey.final('hex');
return mystr;
}

function hidePassword(value, index, array) {
  value["eventPassword"] = "********";
}

function getEventPassword(value, index, array) {
  console.log(value["eventID"]);
  console.log(myEventID);
  if (value["eventID"] == myEventID)
  {
    myEventPassword = value["eventPassword"];
    console.log('found');
  }
}


class EventsController {

    getScratchPad(req, res) {
    myScratchPad = req.body.scratchPad;
    myEventID = parseInt(req.body.eventID,10);
        myEventPassword = "";
        db.forEach(getEventPassword);
        //console.log(myEventPassword);
        var encryptedScratchPad = encryptCustom(myScratchPad,myEventPassword);
        if (encryptedScratchPad == "")
        {
            return res.status(404).send({
            success: 'false',
            message: 'Unable to process scratchpad',
            });
        }
        return res.status(200).send({
          success: 'true',
          message: 'ScratchPad encrypted successfully',
          encryptedScratchPad,
        });
  }

  getAllEvents(req, res) {
    var safeDB = db;
    safeDB.forEach(hidePassword);
    return res.status(200).send({
      success: 'true',
      message: 'Events retrieved successfully',
      Events: db,
    });
  }

  getEvent(req, res) {
    const eventID = parseInt(req.params.eventID, 10);
    db.map((Event) => {
      if (Event.eventID === eventID) {
        Event.eventPassword = "********";
        return res.status(200).send({
          success: 'true',
          message: 'Event retrieved successfully',
          Event,
        });
      }
    });
    return res.status(404).send({
      success: 'false',
      message: 'Event does not exist',
    });
  }

  createEvent(req, res) {
    if (!req.body.eventName) {
      return res.status(400).send({
        success: 'false',
        message: 'eventName is required',
      });
    } else if (!req.body.eventStartDate) {
      return res.status(400).send({
        success: 'false',
        message: 'eventStartDate is required',
      });
    }
    else if (!req.body.eventEndDate) {
      return res.status(400).send({
        success: 'false',
        message: 'eventEndDate is required',
      });
    }
    else if (!req.body.eventPassword) {
      return res.status(400).send({
        success: 'false',
        message: 'eventPassword is required',
      });
    }
    const Event = {
      eventID: db.length + 1,
      eventName: req.body.eventName,
      eventStartDate: req.body.eventStartDate,
      eventStartDate: req.body.eventEndDate,
      eventPassword: req.body.eventPassword,
    };
    db.push(Event);
    // persist to storage
    fs.writeFile(eventPath, JSON.stringify(db, null, 2)  , function (err) {
  if (err) throw err;
  console.log('Saved!');
});
    return res.status(201).send({
      success: 'true',
      message: 'Event added successfully',
      Event,
    });
  }

  updateEvent(req, res) {
    const eventID = parseInt(req.params.eventID, 10);
    const eventPassword = req.params.eventPassword;
    let EventFound;
    let itemIndex;
    db.map((Event, index) => {
      if ((Event.eventID === eventID)
        && (Event.eventPassword === eventPassword)) {
        EventFound = Event;
        itemIndex = index;
      }
    });

    if (!EventFound) {
      return res.status(404).send({
        success: 'false',
        message: 'Event not found',
      });
    }
    if (!req.body.eventName) {
      return res.status(400).send({
        success: 'false',
        message: 'eventName is required',
      });
    } 
    else if (!req.body.eventPassword) {
      return res.status(400).send({
        success: 'false',
        message: 'eventPassword is required',
      });
    }

    const newEvent = {
      eventID: EventFound.eventID,
      eventName: req.body.eventName || EventFound.eventName,
      eventStartDate: req.body.eventStartDate || EventFound.eventStartDate,
      eventEndDate: req.body.eventEndDate || EventFound.eventEndDate,
      eventPassword: req.body.eventPassword || EventFound.eventPassword,
    };

    db.splice(itemIndex, 1, newEvent);
    // persist to storage
    fs.writeFile(eventPath, JSON.stringify(db, null, 2)  , function (err) {
  if (err) throw err;
  console.log('Saved!');
});
    return res.status(201).send({
      success: 'true',
      message: 'Event updated successfully',
      newEvent,
    });
  }

  deleteEvent(req, res) {
    const eventID = parseInt(req.params.eventID, 10);
    let EventFound;
    let itemIndex;
    db.map((Event, index) => {
      if (Event.eventID === eventID) {
        EventFound = Event;
        itemIndex = index;
      }
    });

    if (!EventFound) {
      return res.status(404).send({
        success: 'false',
        message: 'Event not found',
      });
    }
    db.splice(itemIndex, 1);
    // persist to storage
    fs.writeFile(eventPath, JSON.stringify(db, null, 2)  , function (err) {
  if (err) throw err;
  console.log('Saved!');
});
    return res.status(200).send({
      success: 'true',
      message: 'Event deleted successfuly',
    });
  }

}

const EventController = new EventsController();
export default EventController;
