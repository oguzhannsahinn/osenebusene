import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/api';
import { toast } from 'react-toastify';

const Categories = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Kategoriler yüklenirken bir hata oluştu');
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (!newCategory.trim()) return;

      try {
        const response = await categoryService.create({
          name: newCategory,
          icon: '📌'
        });
        setCategories([response.data, ...categories]);
        setNewCategory('');
        toast.success('Kategori başarıyla eklendi');
      } catch (error) {
        toast.error('Kategori eklenirken bir hata oluştu');
      }
    }
  };

  const handleDeleteCategory = async (e, categoryId) => {
    e.stopPropagation();
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        await categoryService.delete(categoryId);
        setCategories(categories.filter(cat => cat.id !== categoryId));
        if (selectedCategory?.id === categoryId) {
          onSelectCategory(null);
        }
        toast.success('Kategori başarıyla silindi');
      } catch (error) {
        toast.error('Kategori silinirken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return <div className="categories-side">Yükleniyor...</div>;
  }

  return (
    <div className="categories-side">
      <h2 className="categories-title">Kategoriler</h2>
      <div className="add-category">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={handleAddCategory}
          placeholder="Yeni kategori ekle"
        />
        <button className="add-button" onClick={handleAddCategory}>
          +
        </button>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div
            key={category.id}
            className={`category-card ${selectedCategory?.id === category.id ? 'selected' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <h3>{category.name}</h3>
              <button
                className="delete-category-button"
                onClick={(e) => handleDeleteCategory(e, category.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories; 