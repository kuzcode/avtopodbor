import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID } from '../appwrite';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Doc.css'

export default function RealtyPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Состояния для календаря
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [comment, setComment] = useState('');
  const [realtyPeriod, setRealtyPeriod] = useState('');

  // Функция для расчета количества дней между датами
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  // Функция для расчета общей стоимости
  const calculateTotalPrice = (pricePerMonth) => {
    if (!pricePerMonth) return null;
    
    if (realtyPeriod === '6months') {
      return parseFloat(pricePerMonth) * 6;
    } else if (realtyPeriod === 'year') {
      return parseFloat(pricePerMonth) * 12;
    } else if (realtyPeriod === 'calendar') {
      const days = calculateDays();
      if (days === 0) return null;
      return parseFloat(pricePerMonth) * (days / 30); // Примерный расчет по дням
    }
    
    return null;
  };

  // Загрузка параметров из URL
  useEffect(() => {
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const realtyPeriodParam = searchParams.get('realtyPeriod');

    if (startDateParam) {
      setStartDate(new Date(startDateParam));
    }
    if (endDateParam) {
      setEndDate(new Date(endDateParam));
    }
    if (realtyPeriodParam) {
      setRealtyPeriod(realtyPeriodParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
        setDoc(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div style={{ padding: 16 }}><p>Загрузка...</p></div>;
  if (!doc) return <div style={{ padding: 16 }}><p>Документ не найден</p></div>;

  const days = calculateDays();
  const totalPrice = calculateTotalPrice(doc.price);

  return (
    <div className='App' style={{ padding: 16 }}>
      <Link to="/" className='linkback'>Назад</Link>
      <div style={{ marginTop: 12 }}>
        {doc.img && <img alt={doc.name} src={doc.img} style={{ maxWidth: '100%', borderRadius: 12 }} />}
        <h2 style={{ margin: '12px 0' }} className='docname'>{doc.name}</h2>
        <p>{doc.description}</p>

        {/* Выбор периода аренды */}
        <div className="realty-period-section" style={{ marginTop: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Период аренды</h3>
          <div className="period-options">
            <div
              className={`period-option ${realtyPeriod === 'calendar' ? 'active' : ''}`}
              onClick={() => setRealtyPeriod(realtyPeriod === 'calendar' ? '' : 'calendar')}
            >
              <p>Выбрать на календаре</p>
            </div>
            <div
              className={`period-option ${realtyPeriod === '6months' ? 'active' : ''}`}
              onClick={() => setRealtyPeriod(realtyPeriod === '6months' ? '' : '6months')}
            >
              <p>6 месяцев</p>
            </div>
            <div
              className={`period-option ${realtyPeriod === 'year' ? 'active' : ''}`}
              onClick={() => setRealtyPeriod(realtyPeriod === 'year' ? '' : 'year')}
            >
              <p>Год</p>
            </div>
          </div>
        </div>

        {/* Календарь (показывается только если выбран "календарь") */}
        {realtyPeriod === 'calendar' && (
          <div className="calendar-section" style={{ marginTop: 20 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Период аренды</h3>
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
        )}

        {/* Расчет стоимости */}
        {doc.price && realtyPeriod && totalPrice && (
          <div className="price-calculation-section" style={{
            marginTop: 20,
            padding: 0,
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Итого</h3>
            <p className='price-calculation' style={{
              fontSize: '16px',
              margin: 0,
              fontWeight: 'bold'
            }}>
              {realtyPeriod === 'calendar' && days > 0 ? (
                `${parseFloat(doc.price).toLocaleString('ru-RU')}฿/мес × ${days} дн. ≈ ${totalPrice.toLocaleString('ru-RU')}฿`
              ) : realtyPeriod === '6months' ? (
                `${parseFloat(doc.price).toLocaleString('ru-RU')}฿/мес × 6 мес. = ${totalPrice.toLocaleString('ru-RU')}฿`
              ) : realtyPeriod === 'year' ? (
                `${parseFloat(doc.price).toLocaleString('ru-RU')}฿/мес × 12 мес. = ${totalPrice.toLocaleString('ru-RU')}฿`
              ) : null}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '12px 0 12px 0', fontSize: '18px' }}>Комментарий</h3>
            <textarea rows={3} value={comment} onChange={(e) => {setComment(e.target.value)}} />

            <button className='bron' style={{ marginTop: 16, marginLeft: 0 }}
              onClick={() => {
                const botToken = "8221206378:AAEcA2xJvfokMJy8gBrWpqiMn4gXsRpjCHw";
                const chatId = "5864245473";
                const periodText = realtyPeriod === 'calendar' ? 
                  `${startDate?.toLocaleDateString('ru-RU')} - ${endDate?.toLocaleDateString('ru-RU')}` :
                  realtyPeriod === '6months' ? '6 месяцев' : 'Год';
                const message = `Заявка на просмотр недвижимости: ${doc.name}\nПериод: ${periodText}\nСтоимость: ${totalPrice.toLocaleString('ru-RU')}฿\nКомментарий: ${comment}`;
                const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
                fetch(url)
                  .then(response => response.json())
                  .then(data => {
                    alert('Заявка отправлена!');
                  })
                  .catch(error => {
                    console.error('Ошибка при отправке сообщения:', error);
                  });
              }}
            >
              Записаться на просмотр
            </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}


