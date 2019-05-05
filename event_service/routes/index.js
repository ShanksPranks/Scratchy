import express from 'express';
import EventController from '../eventsController/events';

const router = express.Router();

router.get('/api/v1/Events', EventController.getAllEvents);
router.get('/api/v1/Events/:eventID', EventController.getEvent);
router.post('/api/v1/Events', EventController.createEvent);
router.put('/api/v1/Events/:eventID', EventController.updateEvent);
router.delete('/api/v1/Events/:eventID', EventController.deleteEvent);
router.get('/api/v1/ScratchPads/:scratchPadID', EventController.getScratchPad);
router.post('/api/v1/ScratchPads', EventController.createScratchPad);

export default router;
