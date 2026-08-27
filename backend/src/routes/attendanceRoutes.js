import express from 'express';
import {
  getAttendance,
  getTodaySummary,
  clockIn,
  clockOut,
  manualRecord,
  deleteAttendance,
} from '../controllers/attendanceController.js';

const router = express.Router();

router.route('/').get(getAttendance).post(manualRecord);
router.route('/today-summary').get(getTodaySummary);
router.route('/clock-in').post(clockIn);
router.route('/clock-out').post(clockOut);
router.route('/:id').delete(deleteAttendance);

export default router;
