const { db } = require('./firebase');

const defaultCategories = [
  { name: 'Kişisel Gelişim', icon: '🎯' },
  { name: 'Sağlık & Spor', icon: '💪' },
  { name: 'Kariyer', icon: '💼' },
  { name: 'Eğitim', icon: '📚' },
  { name: 'Seyahat', icon: '✈️' },
  { name: 'Finansal Hedefler', icon: '💰' }
];

const seedCategories = async (userId) => {
  try {
    const batch = db.batch();
    
    // Önce kullanıcının mevcut kategorilerini kontrol et
    const existingCategories = await db.collection('categories')
      .where('userId', '==', userId)
      .get();

    if (existingCategories.empty) {
      // Varsayılan kategorileri ekle
      defaultCategories.forEach((category) => {
        const docRef = db.collection('categories').doc();
        batch.set(docRef, {
          ...category,
          userId,
          createdAt: new Date()
        });
      });

      await batch.commit();
      console.log('Varsayılan kategoriler eklendi');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    return false;
  }
};

module.exports = { seedCategories }; 