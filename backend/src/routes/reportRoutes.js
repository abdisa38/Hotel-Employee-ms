import express from 'express';
import {
  getPunctualityScorecard,
  getDepartmentAnalytics,
  getShiftCoverage,
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/punctuality-scorecard', getPunctualityScorecard);
router.get('/department-analytics', getDepartmentAnalytics);
router.get('/shift-coverage', getShiftCoverage);

export default router;
