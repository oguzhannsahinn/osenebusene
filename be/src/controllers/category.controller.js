const { validationResult } = require('express-validator');
const { db } = require('../config/firebase');

// Kategorileri getir
const getCategories = async (req, res) => {
  try {
    const categoriesRef = db.collection('categories')
      .where('userId', '==', req.user.id);
    
    const snapshot = await categoriesRef.get();
    const categories = [];
    
    snapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Kategoriler getirilirken bir hata oluştu' });
  }
};

// Yeni kategori oluştur
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, icon } = req.body;
    
    const newCategory = await db.collection('categories').add({
      name,
      icon,
      userId: req.user.id,
      createdAt: new Date()
    });

    res.status(201).json({
      id: newCategory.id,
      name,
      icon,
      userId: req.user.id
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Kategori oluşturulurken bir hata oluştu' });
  }
};

// Kategori güncelle
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, icon } = req.body;

    const categoryRef = db.collection('categories').doc(id);
    const doc = await categoryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    if (doc.data().userId !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await categoryRef.update({
      name,
      icon,
      updatedAt: new Date()
    });

    res.json({
      id,
      name,
      icon,
      userId: req.user.id
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Kategori güncellenirken bir hata oluştu' });
  }
};

// Kategori sil
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoryRef = db.collection('categories').doc(id);
    const doc = await categoryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    if (doc.data().userId !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // İlgili hedefleri de sil
    const goalsRef = db.collection('goals').where('categoryId', '==', id);
    const goals = await goalsRef.get();
    
    const batch = db.batch();
    goals.forEach(goal => {
      batch.delete(goal.ref);
    });
    
    // Kategoriyi sil
    batch.delete(categoryRef);
    
    await batch.commit();

    res.json({ message: 'Kategori ve ilgili hedefler başarıyla silindi' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Kategori silinirken bir hata oluştu' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}; 