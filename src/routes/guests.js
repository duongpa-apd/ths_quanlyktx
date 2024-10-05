import express from 'express';
import GuestsController from '../app/controllers/GuestsController.js';

const router = express.Router();

router.get('/create', GuestsController.create);
router.post('/create', GuestsController.store);
router.get('/:id', GuestsController.detail);
router.get('/edit/:id', GuestsController.edit);
router.post('/update/:id', GuestsController.update);
router.post('/delete/:id', GuestsController.delete);

router.get('/:id/visitlogs/create', GuestsController.getCreateVisitLog);
router.post('/:id/visitlogs/create', GuestsController.postCreateVisitLog);

router.use('/', GuestsController.index);

export default router;
