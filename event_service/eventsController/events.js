/* eslint-disable class-methods-use-this */
import db from '../db/event_db';
import dbs from '../db/event_dbS';

// npm libraries
var crypto = require('crypto');

// gl0bals 
var myEventPassword = "";
var myEventID = 0;

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
  if (value["eventID"] == myEventID)
  {
    myEventPassword = value["eventPassword"];
  }
}


class EventsController {

    getScratchPad(req, res) {
    const scratchPadID = parseInt(req.params.scratchPadID, 10);
    dbs.map((ScratchPad) => {
      if (ScratchPad.scratchPadID === scratchPadID) {
        myEventPassword = "";
        myEventID = ScratchPad.eventID;
        db.forEach(getEventPassword);
        ScratchPad.encryptedScratchPad = encryptData(ScratchPad.scratchPad, myEventPassword);
        return res.status(200).send({
          success: 'true',
          message: 'ScratchPad retrieved successfully',
          ScratchPad,
        });
      }
    });
    return res.status(404).send({
      success: 'false',
      message: 'ScratchPad does not exist',
    });
  }

  createScratchPad(req, res) {
    if (!req.body.userName) {
      return res.status(400).send({
        success: 'false',
        message: 'userName is required',
      });
    } else if (!req.body.scratchPad) {
      return res.status(400).send({
        success: 'false',
        message: 'scratchPad is required',
      });
    }
    else if (!req.body.eventID) {
      return res.status(400).send({
        success: 'false',
        message: 'eventID is required',
      });
    }
    const ScratchPad = {
      scratchPadID: dbs.length + 1,
      eventID: req.body.eventID,
      userName: req.body.userName,
      scratchPad: req.body.scratchPad,
      encryptedScratchPad: "",
    };
    dbs.push(ScratchPad);
    return res.status(201).send({
      success: 'true',
      message: 'ScratchPad added successfully',
      ScratchPad,
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

    return res.status(200).send({
      success: 'true',
      message: 'Event deleted successfuly',
    });
  }

}

const EventController = new EventsController();
export default EventController;
