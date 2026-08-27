import express from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/roleController.js';

const router = express.Router();

router.route('/').get(getRoles).post(createRole);
router.route('/:id').get(getRoleById).put(updateRole).delete(deleteRole);

export default router;
