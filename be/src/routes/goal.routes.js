const express = require('express');
const { body } = require('express-validator');
const goalController = require('../controllers/goal.controller');

const router = express.Router();

router.get('/', goalController.getGoals);
router.get('/category/:categoryId', goalController.getGoalsByCategory);

router.post('/', [
  body('title').notEmpty().withMessage('Hedef başlığı boş olamaz'),
  body('categoryId').notEmpty().withMessage('Kategori seçilmelidir'),
], goalController.createGoal);

router.put('/:id', [
  body('title').notEmpty().withMessage('Hedef başlığı boş olamaz'),
], goalController.updateGoal);

router.patch('/:id/complete', goalController.toggleGoalComplete);

router.delete('/:id', goalController.deleteGoal);

module.exports = router; 