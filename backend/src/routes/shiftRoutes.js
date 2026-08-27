import express from 'express';
import {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  assignShift,
} from '../controllers/shiftController.js';

const router = express.Router();

router.route('/').get(getShifts).post(createShift);
router.route('/assign').post(assignShift);
router.route('/:id').get(getShiftById).put(updateShift).delete(deleteShift);

export default router;
