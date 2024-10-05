import express from 'express';
import RoomsController from '../app/controllers/RoomsController.js';

const router = express.Router();

router.get('/detail/:id', RoomsController.detail);
router.get('/update/:id', RoomsController.edit);
router.post('/update/:id', RoomsController.update);
router.get('/create', RoomsController.create);
router.post('/create', RoomsController.store);
router.post('/delete/:id', RoomsController.delete);

router.use('/', RoomsController.index);

export default router;
