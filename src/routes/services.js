import express from 'express';
import ServicesController from '../app/controllers/ServicesController.js';

const router = express.Router();

router.get('/create', ServicesController.create);
router.post('/create', ServicesController.store);

router.use('/', ServicesController.index);

export default router;
