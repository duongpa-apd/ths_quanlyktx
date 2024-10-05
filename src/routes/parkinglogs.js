import express from 'express';
import ParkingLogsController from '../app/controllers/ParkingLogsController.js';

const router = express.Router();

router.get('/create', ParkingLogsController.create);
router.post('/create', ParkingLogsController.store);

router.use('/', ParkingLogsController.index);

export default router;
