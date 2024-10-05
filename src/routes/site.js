import express from 'express';
import SiteController from '../app/controllers/SiteController.js';

const router = express.Router();

router.get('/payments', SiteController.studentPayments);

router.get('/service-usages', SiteController.studentServiceUsages);

router.get('/visit-logs', SiteController.studentGuestVisitLogs);

router.get('/service-revenues', SiteController.serviceRevenues);

router.get('/check-constraints', SiteController.checkConstraints);

router.use('/', SiteController.index);

export default router;
