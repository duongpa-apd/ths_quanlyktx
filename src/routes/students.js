import express from 'express';
import StudentsController from '../app/controllers/StudentsController.js';

const router = express.Router();

router.get('/create', StudentsController.create);
router.post('/create', StudentsController.store);

router.get('/update/:id', StudentsController.edit);
router.post('/update/:id', StudentsController.update);

router.post('/delete/:id', StudentsController.delete);

router.get('/detail/:id', StudentsController.detail);
router.use('/', StudentsController.index);

export default router;
