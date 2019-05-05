import express from 'express';
import EventController from '../eventsController/events';

const router = express.Router();

router.get('/api/v1/events', EventController.getAllEvents);
router.get('/api/v1/Events/:eventID', EventController.getEvent);
router.post('/api/v1/Events', EventController.createEvent);
router.put('/api/v1/Events/:eventID', EventController.updateEvent);
router.delete('/api/v1/Events/:eventID', EventController.deleteEvent);

export default router;
