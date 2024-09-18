import express from 'express';
import SiteController from '../app/controllers/SiteController.js';

const router = express.Router();

router.use('/search', SiteController.search);
router.use('/', SiteController.index);

export default router;
