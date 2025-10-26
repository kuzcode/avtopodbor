import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID } from '../appwrite';
import './Doc.css';

export default function EditCardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Состояния для редактирования
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [img, setImg] = useState('');
  const [city, setCity] = useState(0);
  const [carType, setCarType] = useState('');
  const [homeClass, setHomeClass] = useState('');
  const [tourType, setTourType] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
        setDoc(res);
        setName(res.name || '');
        setDescription(res.description || '');
        setPrice(res.price || 0);
        setImg(res.img || '');
        setCity(res.city || 0);
        setCarType(res.carType || 0);
        setHomeClass(res.homeClass || 0);
        setTourType(res.tourType || 0);
      } catch (e) {
        console.error(e);
        alert('Ошибка загрузки карточки');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleDelete = async () => {
    setSaving(true);
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id)
      alert('Карточка удалена');
    setSaving(false);
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Заполните название и цену');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name,
        description,
        price,
        img,
        city,
      };

      // Добавляем специфичные поля в зависимости от типа
      const docType = parseInt(doc.type);
      if (docType === 0) { // Авто
        updateData.carType = carType;
      } else if (docType === 2) { // Недвижимость
        updateData.homeClass = homeClass;
      } else if (docType === 3) { // Экскурсия
        updateData.tourType = tourType;
      }

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, updateData);
      alert('Изменения сохранены!');
      navigate('/admin');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const getTypeName = (type) => {
    const types = ['Авто', 'Мото', 'Недвижимость', 'Экскурсия'];
    return types[parseInt(type)] || 'Неизвестно';
  };

  if (loading) return <div style={{ padding: 16 }}><p>Загрузка...</p></div>;
  if (!doc) return <div style={{ padding: 16 }}><p>Документ не найден</p></div>;

  const docType = parseInt(doc.type);

  return (
    <div className='App' style={{ padding: 16 }}>
      <button
        className='bron'
        onClick={() => navigate('/admin')}
        style={{ marginBottom: '16px', padding: '8px 16px' }}
      >
        ← Назад
      </button>

      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Редактирование: {getTypeName(doc.type)}</h1>

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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
            onChange={(e) => setCity(parseInt(e.target.value))}
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px' }}
          >
            <option value={0}>Пхукет</option>
            <option value={1}>Паттайя</option>
          </select>
        </div>

        {/* Специфичные поля для Авто */}
        {docType === 0 && (
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
        {docType === 2 && (
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
        {docType === 3 && (
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

        <button
          className='bron'
          onClick={handleDelete}
          style={{
            marginTop: '24px',
            padding: '12px 32px',
            fontSize: '18px',
            width: '100%',
            background: '#ff0000'
          }}
          disabled={saving}
        >
          Удалить
        </button>

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
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  );
}

