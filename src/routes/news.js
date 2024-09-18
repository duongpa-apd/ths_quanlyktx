import express from 'express';
import NewsController from '../app/controllers/NewsController.js';

const router = express.Router();
// const newsController = require('../app/controllers/NewsController');

router.use('/:slug', NewsController.show);
router.use('/', NewsController.index);

export default router;
