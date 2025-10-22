import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID } from '../appwrite';

export default function RealtyPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div style={{ padding: 16 }}>
      <Link to="/">Назад</Link>
      <div style={{ marginTop: 12 }}>
        {doc.img && <img alt="" src={doc.img} style={{ maxWidth: '100%', borderRadius: 12 }} />}
        <h2 style={{ margin: '12px 0' }}>{doc.name}</h2>
      </div>
    </div>
  );
}


