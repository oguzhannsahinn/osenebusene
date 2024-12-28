const { validationResult } = require('express-validator');
const { db } = require('../config/firebase');

// Tüm hedefleri getir
const getGoals = async (req, res) => {
  try {
    const goalsRef = db.collection('goals')
      .where('userId', '==', req.user.id);
    
    const snapshot = await goalsRef.get();
    const goals = [];
    
    snapshot.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Hedefler getirilirken bir hata oluştu' });
  }
};

// Kategoriye göre hedefleri getir
const getGoalsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const goalsRef = db.collection('goals')
      .where('userId', '==', req.user.id)
      .where('categoryId', '==', categoryId);
    
    const snapshot = await goalsRef.get();
    const goals = [];
    
    snapshot.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(goals);
  } catch (error) {
    console.error('Get goals by category error:', error);
    res.status(500).json({ message: 'Hedefler getirilirken bir hata oluştu' });
  }
};

// Yeni hedef oluştur
const createGoal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, image, categoryId } = req.body;

    // Kategori kontrolü
    const categoryRef = db.collection('categories').doc(categoryId);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    if (categoryDoc.data().userId !== req.user.id) {
      return res.status(403).json({ message: 'Bu kategoriye hedef eklemek için yetkiniz yok' });
    }

    const newGoal = await db.collection('goals').add({
      title,
      description: description || '',
      image: image || '',
      categoryId,
      userId: req.user.id,
      completed: false,
      createdAt: new Date()
    });

    res.status(201).json({
      id: newGoal.id,
      title,
      description,
      image,
      categoryId,
      completed: false,
      userId: req.user.id
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Hedef oluşturulurken bir hata oluştu' });
  }
};

// Hedef güncelle
const updateGoal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, image } = req.body;

    const goalRef = db.collection('goals').doc(id);
    const doc = await goalRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Hedef bulunamadı' });
    }

    if (doc.data().userId !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await goalRef.update({
      title,
      description: description || '',
      image: image || '',
      updatedAt: new Date()
    });

    res.json({
      id,
      title,
      description,
      image,
      ...doc.data()
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Hedef güncellenirken bir hata oluştu' });
  }
};

// Hedef tamamlama durumunu değiştir
const toggleComplete = async (req, res) => {
  try {
    const goalRef = db.collection('goals').doc(req.params.id);
    const goal = await goalRef.get();

    if (!goal.exists) {
      return res.status(404).json({ message: 'Hedef bulunamadı' });
    }

    const currentData = goal.data();
    const newCompleted = !currentData.completed;

    await goalRef.update({
      completed: newCompleted,
      updatedAt: new Date()
    });

    // Güncellenmiş veriyi döndür
    const updatedGoal = {
      id: goal.id,
      ...currentData,
      completed: newCompleted,
      updatedAt: new Date()
    };

    res.json(updatedGoal);

  } catch (error) {
    console.error('Toggle complete error:', error);
    res.status(500).json({ message: 'Hedef durumu güncellenirken bir hata oluştu' });
  }
};

// Hedef sil
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const goalRef = db.collection('goals').doc(id);
    const doc = await goalRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Hedef bulunamadı' });
    }

    if (doc.data().userId !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await goalRef.delete();

    res.json({ message: 'Hedef başarıyla silindi' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Hedef silinirken bir hata oluştu' });
  }
};

module.exports = {
  getGoals,
  getGoalsByCategory,
  createGoal,
  updateGoal,
  toggleComplete,
  deleteGoal
}; 