const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const { seedCategories } = require('../config/seedData');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Email kontrolü
    const userRef = db.collection('users').where('email', '==', email);
    const userDoc = await userRef.get();
    
    if (!userDoc.empty) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' });
    }

    // Şifre hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      // Kullanıcı oluşturma
      const userDocRef = await db.collection('users').add({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date()
      });

      // Varsayılan kategorileri ekle
      await seedCategories(userDocRef.id);

      // Token oluşturma
      const token = jwt.sign(
        { id: userDocRef.id, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'Kullanıcı başarıyla oluşturuldu',
        token,
        user: {
          id: userDocRef.id,
          email,
          name
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Veritabanı işlemi sırasında hata oluştu');
    }

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Kayıt işlemi başarısız oldu',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Kullanıcı kontrolü
    const userRef = db.collection('users').where('email', '==', email);
    const userDoc = await userRef.get();

    if (userDoc.empty) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    const user = {
      id: userDoc.docs[0].id,
      ...userDoc.docs[0].data()
    };

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Geçersiz şifre' });
    }

    // Token oluşturma
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Giriş işlemi başarısız oldu' });
  }
};

module.exports = {
  register,
  login
}; 