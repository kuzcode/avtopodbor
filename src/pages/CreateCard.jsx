import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID } from '../appwrite';
import './Doc.css';

export default function CreateCardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const typeParam = searchParams.get('type');
  const defaultType = typeParam ? parseInt(typeParam) : 0;

  // Состояния для создания
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState('');
  const [city, setCity] = useState(0);
  const [carType, setCarType] = useState(0);
  const [homeClass, setHomeClass] = useState(0);
  const [tourType, setTourType] = useState(0);

  const getTypeName = (type) => {
    const types = ['Авто', 'Мото', 'Недвижимость', 'Экскурсия'];
    return types[type] || 'Неизвестно';
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Заполните название и цену');
      return;
    }

    setSaving(true);
    try {
      const createData = {
        name,
        description,
        price,
        img,
        city,
        type: defaultType,
      };

      // Добавляем специфичные поля в зависимости от типа
      if (defaultType === 0) { // Авто
        createData.carType = carType || 0;
      } else if (defaultType === 2) { // Недвижимость
        createData.homeClass = homeClass || 0;
      } else if (defaultType === 3) { // Экскурсия
        createData.tourType = tourType || 0;
      }

      const ID = `card_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID, createData);
      alert('Карточка создана!');
      navigate('/admin');
    } catch (error) {
      console.error('Ошибка при создании:', error);
      alert('Ошибка при создании');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='App' style={{ padding: 16 }}>
      <button 
        className='bron' 
        onClick={() => navigate('/admin')}
        style={{ marginBottom: '16px', padding: '8px 16px' }}
      >
        ← Назад
      </button>

      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Создание карточки: {getTypeName(defaultType)}</h1>

      <div style={{ maxWidth: '600px' }}>
        {/* Общие поля */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Название *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Цена *</label>
          <input
            type="number"
            value={price.toString()}
            onChange={(e) => setPrice(parseInt(e.target.value))}
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>URL изображения</label>
          <input
            type="text"
            value={img}
            onChange={(e) => setImg(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Город</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px' }}
          >
            <option value="0">Пхукет</option>
            <option value="1">Паттайя</option>
          </select>
        </div>

        {/* Специфичные поля для Авто */}
        {defaultType === 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Тип автомобиля</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className={carType === 0 ? 'bron active' : 'bron'}
                onClick={() => setCarType(0)}
                style={{ padding: '10px 20px' }}
              >
                Седан
              </button>
              <button
                className={carType === 1 ? 'bron active' : 'bron'}
                onClick={() => setCarType(1)}
                style={{ padding: '10px 20px' }}
              >
                Кроссовер
              </button>
            </div>
          </div>
        )}

        {/* Специфичные поля для Недвижимости */}
        {defaultType === 2 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Класс недвижимости</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className={homeClass === 0 ? 'bron active' : 'bron'}
                onClick={() => setHomeClass(0)}
                style={{ padding: '10px 20px' }}
              >
                Стандарт
              </button>
              <button
                className={homeClass === 1 ? 'bron active' : 'bron'}
                onClick={() => setHomeClass(1)}
                style={{ padding: '10px 20px' }}
              >
                Макси
              </button>
            </div>
          </div>
        )}

        {/* Специфичные поля для Экскурсий */}
        {defaultType === 3 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Тип экскурсии</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className={tourType === 0 ? 'bron active' : 'bron'}
                onClick={() => setTourType(0)}
                style={{ padding: '10px 20px' }}
              >
                Острова
              </button>
              <button
                className={tourType === 1 ? 'bron active' : 'bron'}
                onClick={() => setTourType(1)}
                style={{ padding: '10px 20px' }}
              >
                Квадро
              </button>
              <button
                className={tourType === 2 ? 'bron active' : 'bron'}
                onClick={() => setTourType(2)}
                style={{ padding: '10px 20px' }}
              >
                Гидроциклы
              </button>
              <button
                className={tourType === 3 ? 'bron active' : 'bron'}
                onClick={() => setTourType(3)}
                style={{ padding: '10px 20px' }}
              >
                Эндуро
              </button>
            </div>
          </div>
        )}

        {/* Кнопка сохранения */}
        <button 
          className='bron' 
          onClick={handleSave}
          disabled={saving}
          style={{ 
            marginTop: '24px', 
            padding: '12px 32px', 
            fontSize: '18px',
            width: '100%'
          }}
        >
          {saving ? 'Создание...' : 'Создать карточку'}
        </button>
      </div>
    </div>
  );
}

