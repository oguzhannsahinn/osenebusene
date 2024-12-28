const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

router.get('/', categoryController.getCategories);

router.post('/', [
  body('name').notEmpty().withMessage('Kategori adı boş olamaz'),
  body('icon').notEmpty().withMessage('Kategori ikonu boş olamaz')
], categoryController.createCategory);

router.put('/:id', [
  body('name').notEmpty().withMessage('Kategori adı boş olamaz'),
  body('icon').notEmpty().withMessage('Kategori ikonu boş olamaz')
], categoryController.updateCategory);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 