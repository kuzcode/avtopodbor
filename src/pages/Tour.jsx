import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID } from '../appwrite';
import './Doc.css'

export default function TourPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

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

  return (
    <div className='App' style={{ padding: 16 }}>
      <Link to="/" className='linkback'>Назад</Link>
      <div style={{ marginTop: 12 }}>
        {doc.img && <img alt={doc.name} src={doc.img} style={{ maxWidth: '100%', borderRadius: 12 }} />}
        <h2 style={{ margin: '12px 0' }} className='docname'>{doc.name}</h2>
        <p>{doc.description}</p>

        {/* Информация о цене */}
        {doc.price && (
          <div className="price-calculation-section" style={{
            marginTop: 20,
            padding: 0,
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Стоимость</h3>
            <p className='price-calculation' style={{
              fontSize: '16px',
              margin: 0,
              fontWeight: 'bold'
            }}>
              {parseFloat(doc.price).toLocaleString('ru-RU')}฿/человек
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '12px 0 12px 0', fontSize: '18px' }}>Комментарий</h3>
            <textarea rows={3} value={comment} onChange={(e) => {setComment(e.target.value)}} />

            <button className='bron' style={{ marginTop: 16, marginLeft: 0 }}
              onClick={() => {
                const botToken = "8221206378:AAEcA2xJvfokMJy8gBrWpqiMn4gXsRpjCHw";
                const chatId = "5864245473";
                const message = `Заявка на экскурсию: ${doc.name}\nСтоимость: ${parseFloat(doc.price).toLocaleString('ru-RU')}฿/человек\nКомментарий: ${comment}`;
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
              Забронировать
            </button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}


