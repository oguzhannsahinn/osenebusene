import React, { useState, useEffect } from 'react';
import { goalService } from '../services/api';
import { toast } from 'react-toastify';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Goals({ selectedCategory, onSelectCategory }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      fetchGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchGoals = async () => {
    try {
      const response = await goalService.getByCategory(selectedCategory.id);
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Hedefler yüklenirken bir hata oluştu');
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Dosya boyutu kontrolü
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
          return;
        }

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
          toast.error('Sadece resim dosyaları yüklenebilir');
          return;
        }

        // Önce local preview için
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewGoal(prev => ({ ...prev, imagePreview: reader.result }));
        };
        reader.readAsDataURL(file);

        try {
          // Firebase Storage'a yükleme
          const fileName = `goals/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, fileName);

          // Metadata
          const metadata = {
            contentType: file.type
          };

          console.log('Uploading file:', {
            fileName,
            fileType: file.type,
            fileSize: file.size,
            metadata
          });

          // Dosyayı yükle
          const snapshot = await uploadBytes(storageRef, file, metadata);
          console.log('Upload successful:', snapshot);

          // URL'i al
          const downloadURL = await getDownloadURL(storageRef);
          console.log('Download URL:', downloadURL);

          if (!downloadURL) {
            throw new Error('Download URL alınamadı');
          }

          setNewGoal(prev => ({ ...prev, image: downloadURL }));
          toast.success('Görsel başarıyla yüklendi');

        } catch (uploadError) {
          console.error('Storage error:', uploadError);
          throw new Error(`Dosya yükleme hatası: ${uploadError.message}`);
        }

      } catch (error) {
        console.error('Image upload error:', error);
        toast.error(error.message || 'Görsel yüklenirken bir hata oluştu');
        
        // Hata durumunda preview'ı temizle
        setNewGoal(prev => ({ 
          ...prev, 
          image: '', 
          imagePreview: '' 
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newGoal.title) {
      toast.error('Hedef başlığı boş olamaz');
      return;
    }

    try {
      const goalData = {
        title: newGoal.title,
        description: newGoal.description || '',
        image: newGoal.image || '', // Firebase'den gelen URL
        categoryId: selectedCategory.id
      };

      console.log('Submitting goal data:', goalData);

      if (editingGoal) {
        const response = await goalService.update(editingGoal.id, goalData);
        setGoals(goals.map(goal => 
          goal.id === editingGoal.id ? response.data : goal
        ));
        toast.success('Hedef güncellendi');
      } else {
        const response = await goalService.create(goalData);
        setGoals([response.data, ...goals]);
        toast.success('Hedef eklendi');
      }
      
      setNewGoal({ title: '', description: '', image: '', imagePreview: '' });
      setEditingGoal(null);
    } catch (error) {
      console.error('Goal submit error:', error);
      toast.error(error.message || (editingGoal ? 'Hedef güncellenirken hata oluştu' : 'Hedef eklenirken hata oluştu'));
    }
  };

  const handleToggleComplete = async (goalId) => {
    try {
      const response = await goalService.toggleComplete(goalId);
      console.log('Toggle response:', response); // Debug için

      // State'i güncellerken response.data'yı kullan
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
        )
      );
      
      // Başarı mesajı göster
      toast.success(response.data.completed ? 'Hedef tamamlandı!' : 'Hedef tamamlanmadı olarak işaretlendi');
      
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Bu hedefi silmek istediğinizden emin misiniz?')) {
      try {
        await goalService.delete(goalId);
        setGoals(goals.filter(goal => goal.id !== goalId));
        toast.success('Hedef silindi');
      } catch (error) {
        toast.error('Hedef silinirken bir hata oluştu');
      }
    }
  };

  if (!selectedCategory) {
    return (
      <div className="goals-side">
        <div className="empty-state">
          <div className="empty-state-content">
            <span className="empty-icon">🎯</span>
            <h2>Hedeflerinizi Görüntüleyin</h2>
            <p>Sol taraftan bir kategori seçerek hedeflerinizi görüntüleyebilir ve yeni hedefler ekleyebilirsiniz.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="goals-side">Yükleniyor...</div>;
  }

  return (
    <div className="goals-side">
      <div className="goals-section">
        <div className="goals-header">
          <h2>{selectedCategory.name} - Hedeflerim</h2>
          <button
            className="close-section-button"
            onClick={() => onSelectCategory(null)}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-container">
            <input
              type="text"
              placeholder="Hedef Başlığı"
              value={newGoal.title}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
            />
            <textarea
              placeholder="Hedef Açıklaması"
              value={newGoal.description}
              onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
            />
            <div className="image-upload">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
              <label htmlFor="image-upload" className="file-label">
                {newGoal.imagePreview ? '📸 Görsel Seçildi' : '📸 Görsel Ekle'}
              </label>
              {newGoal.imagePreview && (
                <>
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => setNewGoal(prev => ({ ...prev, image: '', imagePreview: '' }))}
                  >
                    Görseli Kaldır
                  </button>
                  <div className="image-preview">
                    <img src={newGoal.imagePreview} alt="Preview" />
                  </div>
                </>
              )}
            </div>
            <div className="form-buttons">
              <button type="submit">
                {editingGoal ? 'Hedefi Güncelle' : 'Hedef Ekle'}
              </button>
              {editingGoal && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setEditingGoal(null);
                    setNewGoal({ title: '', description: '', image: '' });
                  }}
                >
                  İptal
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="goals-grid">
          {goals.map(goal => (
            <div
              key={goal.id}
              className={`goal-card ${goal.completed ? 'completed' : ''}`}
            >
              {goal.image && (
                <div className="goal-image-container">
                  <img 
                    src={goal.image} 
                    alt={goal.title} 
                    className="goal-image"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="goal-content">
                <h4>{goal.title}</h4>
                {goal.imageUrl && (
                  <img 
                    src={goal.imageUrl} 
                    alt={goal.title}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      marginBottom: '1rem',
                      borderRadius: '8px'
                    }}
                  />
                )}
                <p>{goal.description}</p>
                <div className="goal-actions">
                  <button
                    className="action-button complete-button"
                    onClick={() => handleToggleComplete(goal.id)}
                  >
                    {goal.completed ? '✓ Tamamlandı' : 'Tamamla'}
                  </button>
                  <button
                    className="action-button edit-button"
                    onClick={() => {
                      setEditingGoal(goal);
                      setNewGoal({
                        title: goal.title,
                        description: goal.description,
                        image: goal.image,
                        imagePreview: goal.image
                      });
                    }}
                  >
                    Düzenle
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(goal.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Goals; 