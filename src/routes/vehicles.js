import express from 'express';
import VehiclesController from '../app/controllers/VehiclesController.js';

const router = express.Router();

router.get('/create', VehiclesController.create);
router.post('/create', VehiclesController.store);

router.get('/update/:id', VehiclesController.edit);
router.post('/update/:id', VehiclesController.update);

// router.post('/delete/:id', VehiclesController.delete);

router.get('/detail/:id', VehiclesController.detail);
router.use('/', VehiclesController.index);

export default router;
