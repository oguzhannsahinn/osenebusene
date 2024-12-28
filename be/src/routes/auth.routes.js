const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('name').notEmpty().withMessage('İsim alanı boş bırakılamaz')
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre alanı boş bırakılamaz')
], authController.login);

module.exports = router; 