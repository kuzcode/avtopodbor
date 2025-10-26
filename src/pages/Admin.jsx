import { useState } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID, Query } from '../appwrite';
import './Doc.css';

export default function AdminPage() {
  const [searchMode, setSearchMode] = useState(null); // 'find' или 'create'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue === 'admin123') {
      setPass(true);
    } else {
      alert('Неверный пароль');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Введите название для поиска');
      return;
    }

    setLoading(true);
    try {
      // Получаем все документы и фильтруем по имени на клиенте
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.select(['$id', 'name', 'type', 'img'])
        ]
      );

      // Фильтруем результаты по имени (содержит введенный текст)
      const filtered = response.documents.filter(doc =>
        doc.name && doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeName = (type) => {
    const types = ['Авто', 'Мото', 'Недвижимость', 'Экскурсия'];
    return types[parseInt(type)] || 'Неизвестно';
  };

  if (pass === true) {
    return (
      <div className='App' style={{ padding: 16 }}>
        <Link to="/" className='linkback'>Назад на главную</Link>

        <div style={{ marginTop: 32 }}>
          <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>Админ-панель</h1>

          {/* Кнопки выбора режима */}
          {!searchMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
              <button
                className='bron'
                onClick={() => setSearchMode('find')}
                style={{ fontSize: '18px', padding: '16px' }}
              >
                Найти карточку
              </button>
              <button
                className='bron'
                onClick={() => setSearchMode('create')}
                style={{ fontSize: '18px', padding: '16px' }}
              >
                Создать карточку
              </button>
            </div>
          )}

          {/* Режим поиска */}
          {searchMode === 'find' && (
            <div style={{ maxWidth: '600px' }}>
              <div style={{ marginBottom: '24px' }}>
                <button
                  className='bron'
                  onClick={() => setSearchMode(null)}
                  style={{ marginBottom: '16px', padding: '8px 16px' }}
                >
                  ← Назад
                </button>
                <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Поиск карточки</h2>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Введите название"
                    style={{
                      flex: 1,
                      padding: '10px',
                      fontSize: '16px',
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                  />
                  <button
                    className='bron'
                    onClick={handleSearch}
                    disabled={loading}
                    style={{ padding: '10px 20px' }}
                  >
                    {loading ? 'Поиск...' : 'Найти'}
                  </button>
                </div>
              </div>

              {/* Результаты поиска */}
              {searchResults.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '12px' }}>Найдено: {searchResults.length}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {searchResults.map((doc) => (
                      <div
                        key={doc.$id}
                        className='doc'
                        onClick={() => window.location.href = `/admin/edit/${doc.$id}`}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '8px'
                        }}
                      >
                        {doc.img && (
                          <img
                            src={doc.img}
                            alt={doc.name}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0' }}>{doc.name}</h4>
                          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            Тип: {getTypeName(doc.type)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && searchQuery && searchResults.length === 0 && (
                <p style={{ color: '#666' }}>Ничего не найдено</p>
              )}
            </div>
          )}

          {/* Режим создания */}
          {searchMode === 'create' && (
            <div style={{ maxWidth: '600px' }}>
              <button
                className='bron'
                onClick={() => setSearchMode(null)}
                style={{ marginBottom: '16px', padding: '8px 16px' }}
              >
                ← Назад
              </button>
              <h2 style={{ fontSize: '22px' }}>Создать карточку</h2>
              <p style={{ color: '#666', margin: '8px 0 16px 0' }}>
                Выберите тип карточки для создания
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '24px' }}>
                <div
                  className='type'
                  onClick={() => window.location.href = '/admin/create?type=0'}
                  style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Авто</p>
                </div>
                <div
                  className='type'
                  onClick={() => window.location.href = '/admin/create?type=1'}
                  style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Мото</p>
                </div>
                <div
                  className='type'
                  onClick={() => window.location.href = '/admin/create?type=2'}
                  style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Недвижимость</p>
                </div>
                <div
                  className='type'
                  onClick={() => window.location.href = '/admin/create?type=3'}
                  style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Экскурсия</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  else {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
      }}>
        <h1 style={{ fontSize: '24px', padding: '24px', margin: 0, color: '#333' }}>Введите пароль для доступа</h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Пароль"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              marginLeft: 24,
              padding: 8,
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              outline: 'none',
              width: '200px',
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              marginLeft: 12,
              padding: '8px 16px',
              fontSize: '16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#45a049')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
          >
            ОК
          </button>
        </div>
      </div>
    );
  }
}

