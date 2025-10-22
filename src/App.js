import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID, Query } from './appwrite';
import AutoPage from './pages/Auto';
import MotoPage from './pages/Moto';
import RealtyPage from './pages/Realty';
import TourPage from './pages/Tour';
import tour from './icons/tour.png'
import home from './icons/home.png'
import moto from './icons/moto.png'
import car from './icons/car.png'
import pin from './icons/pin.png'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const cities = [
    { name: 'Москва', value: 0 },
    { name: 'СПБ', value: 1 },
    { name: 'Новосибирск', value: 2 },
    { name: 'Екатеринбург', value: 3 },
    { name: 'Казань', value: 4 }
  ];
  const types = [
    { name: 'Авто', icon: 'car', value: 0 },
    { name: 'Мото', icon: 'moto', value: 1 },
    { name: 'Недвижимость', icon: 'home', value: 2 },
    { name: 'Экскурсия', icon: 'tour', value: 3 },
  ];

  const icons = [car, moto, home, tour]

  const [city, setCity] = useState(cities[0]);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [type, setType] = useState('Авто');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Состояния для календаря
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Состояния для фильтров
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [carType, setCarType] = useState(''); // '' - все, 'sedan' - седан, 'crossover' - кроссовер
  
  // Функция для расчета количества дней между датами
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };
  
  // Функция для расчета общей стоимости
  const calculateTotalPrice = (pricePerDay) => {
    const days = calculateDays();
    if (!pricePerDay || days === 0) return null;
    return parseFloat(pricePerDay) * days;
  };

  // Функция для получения документов по типу и городу (серверная фильтрация и выборка полей)
  const fetchDocumentsByType = async (typeValue, cityValue) => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('type', [typeValue]),
          Query.equal('city', [cityValue]),
          Query.select(['$id', 'name', 'city', 'type', 'img', 'price', 'carType'])
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Ошибка при получении документов:', error);
      return [];
    }
  };

  // Функция для получения всех документов по городу (серверная фильтрация и выборка полей)
  const fetchAllDocuments = async (cityValue) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('city', [cityValue]),
          Query.select(['$id', 'name', 'city', 'type', 'img', 'price', 'carType'])
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Ошибка при получении всех документов:', error);
      return [];
    }
  };

  // Функция для загрузки данных по городу
  const loadDataForCity = async (cityValue) => {
    try {
      setLoading(true);
      console.log(`Загрузка данных для города: ${cityValue}`);
      
      // Загружаем все документы для выбранного города
      const allDocuments = await fetchAllDocuments(cityValue);
      setDocuments(allDocuments);
      setLoading(false);
      
      console.log('Установлены документы:', allDocuments);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента (город 0 - Москва)
  useEffect(() => {
    loadDataForCity(0);
  }, []);

  // Отслеживание изменений города
  useEffect(() => {
    if (city.value !== undefined) {
      loadDataForCity(city.value);
    }
  }, [city]);

  // Фильтрация документов по выбранному типу, городу, цене и типу автомобиля
  const getFilteredDocuments = () => {
    const selectedType = types.find(t => t.name === type);
    if (!selectedType) return documents;
    
    const filtered = documents.filter(doc => {
      // Проверяем тип
      const docType = parseInt(doc.type);
      const selectedTypeValue = selectedType.value;
      const typeMatch = docType === selectedTypeValue;
      
      // Проверяем город
      const docCity = parseInt(doc.city);
      const selectedCityValue = city.value;
      const cityMatch = docCity === selectedCityValue;
      
      // Проверяем цену (только для авто)
      let priceMatch = true;
      if (type === 'Авто' && doc.price !== undefined && doc.price !== null) {
        const docPrice = parseFloat(doc.price);
        if (priceFrom && !isNaN(parseFloat(priceFrom)) && docPrice < parseFloat(priceFrom)) priceMatch = false;
        if (priceTo && !isNaN(parseFloat(priceTo)) && docPrice > parseFloat(priceTo)) priceMatch = false;
      }
      
      // Проверяем тип автомобиля (только для авто)
      let carTypeMatch = true;
      if (type === 'Авто' && carType && doc.carType !== undefined && doc.carType !== null) {
        const docCarType = parseInt(doc.carType);
        if (carType === 'sedan' && docCarType !== 0) carTypeMatch = false;
        if (carType === 'crossover' && docCarType !== 1) carTypeMatch = false;
      }
      
      const finalMatch = typeMatch && cityMatch && priceMatch && carTypeMatch;
      
      // Отладочная информация
      if (type === 'Авто') {
        console.log('Фильтрация документа:', {
          docName: doc.name,
          docPrice: doc.price,
          docCarType: doc.carType,
          priceFrom: priceFrom,
          priceTo: priceTo,
          carType: carType,
          typeMatch: typeMatch,
          cityMatch: cityMatch,
          priceMatch: priceMatch,
          carTypeMatch: carTypeMatch,
          finalMatch: finalMatch
        });
      }
      
      return finalMatch;
    });
    
    return filtered;
  };

  // Если мы на странице деталки, выводим роуты для страниц и не показываем главную
  if (location.pathname !== '/') {
    return (
      <Routes>
        <Route path="/auto/:id" element={<AutoPage />} />
        <Route path="/moto/:id" element={<MotoPage />} />
        <Route path="/realty/:id" element={<RealtyPage />} />
        <Route path="/tour/:id" element={<TourPage />} />
      </Routes>
    );
  }

  return (
    <div className="App">
      <div
        className='city-select'
        style={{ position: 'relative', width: 'fit-content', padding: '16px 18px' }}
      >
        <button
          onClick={() => setIsCityOpen((open) => !open)}
          className='city'
        >
            <img
              src={pin}
              className='pin'
              alt="Местоположение"
            />
          <p>{city.name}</p>
        </button>
        {isCityOpen && (
          <div className='citySel'>
            {cities.map((c) => (
              <div
                key={c}
                onClick={() => {
                  setCity(c);
                  setIsCityOpen(false);
                }}
                style={{
                  padding: '6px 20px 6px 12px',
                  background: c.name === city.name ? '#ff4000' : 'transparent',
                  color: c.name === city.name ? '#fff' : '#000'
                }}
              >
                <p style={{
                  margin: 0,
                  position: 'relative'
                }}>{c.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='types'>
        {types.map((t, index) =>
          <div
            key={t.name}
            className={`type ${type === t.name ? 'active' : ''}`}
            onClick={() => setType(t.name)}
          >
            <img
              src={icons[index]}
              alt={t.name}
              style={type === t.name ? { filter: 'brightness(0) invert(1)' } : {}}
            />
            <p>{t.name}</p>
          </div>
        )}
      </div>
      
      {/* Календарь и фильтры для авто */}
      {type === 'Авто' && (
        <div className="auto-filters">
          {/* Календарь */}
          <div className="calendar-section">
            <div className="date-pickers">
              <div className="date-picker-group">
                <label>Начало аренды</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Выберите дату"
                  className="date-picker"
                  dateFormat="dd.MM.yyyy"
                />
              </div>
              <div className="date-picker-group">
                <label>Конец аренды</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="Выберите дату"
                  className="date-picker"
                  dateFormat="dd.MM.yyyy"
                />
              </div>
            </div>
          </div>
          
          {/* Фильтр по цене */}
          <div className="price-filter">
            <div className="price-inputs">
              <div className="price-input-group">
                <label>Цена от (₽/сутки)</label>
                <input
                  type="number"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  placeholder="0"
                  className="price-input"
                />
              </div>
              <div className="price-input-group">
                <label>Цена до (₽/сутки)</label>
                <input
                  type="number"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  placeholder="10000"
                  className="price-input"
                />
              </div>
            </div>
          </div>
          
          {/* Фильтр по типу автомобиля */}
          <div className="car-type-filter">
            <div className="car-type-options">
              <div
                className={`car-type-option ${carType === 'sedan' ? 'active' : ''}`}
                onClick={() => setCarType(carType === 'sedan' ? '' : 'sedan')}
              >
                <p>Седан</p>
              </div>
              <div
                className={`car-type-option ${carType === 'crossover' ? 'active' : ''}`}
                onClick={() => setCarType(carType === 'crossover' ? '' : 'crossover')}
              >
                <p>Кроссовер</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Отображение документов */}
      <div className='documents-section'>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className='documents-list'>
            <p style={{fontSize: '14px', color: '#666', margin: '0 0 8px 0'}}>
              Найдено: {getFilteredDocuments().length}
            </p>
            {getFilteredDocuments().map((doc, index) => {
              const days = calculateDays();
              const totalPrice = calculateTotalPrice(doc.price);
              
              return (
                <div
                  key={doc.$id || index}
                  className='doc'
                onClick={() => {
                  const t = parseInt(doc.type);
                  const paths = ['auto', 'moto', 'realty', 'tour'];
                  const base = paths[t] || 'auto';
                  
                  // Передаем даты через URL параметры
                  const params = new URLSearchParams();
                  if (startDate) params.append('startDate', startDate.toISOString());
                  if (endDate) params.append('endDate', endDate.toISOString());
                  
                  const queryString = params.toString();
                  const url = `/${base}/${doc.$id}${queryString ? `?${queryString}` : ''}`;
                  navigate(url);
                }}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={doc.img} alt={doc.name} />
                  <p className='docname'>{doc.name}</p>
                  {type === 'Авто' && doc.price && days > 0 && totalPrice && (
                    <p className='price-calculation'>
                      {parseFloat(doc.price).toLocaleString('ru-RU')}₽ × {days} сут. = {totalPrice.toLocaleString('ru-RU')}₽
                    </p>
                  )}

                  <button className='bron'>Забронировать</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
