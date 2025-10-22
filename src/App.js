import './App.css';
import { useState } from 'react';
import tour from './icons/tour.png'
import home from './icons/home.png'
import moto from './icons/moto.png'
import car from './icons/car.png'
import pin from './icons/pin.png'

function App() {
  const cities = ['Москва', 'СПБ', 'Новосибирск', 'Екатеринбург', 'Казань'];
  const types = [
    { name: 'Авто', icon: 'car' },
    { name: 'Мото', icon: 'moto' },
    { name: 'Недвижимость', icon: 'home' },
    { name: 'Экскурсия', icon: 'tour' },
  ];

  const icons = [car, moto, home, tour]

  const [city, setCity] = useState(cities[0]);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [type, setType] = useState('Авто');

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
            />
          <p>{city}</p>
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
                  background: c === city ? '#ff4000' : 'transparent',
                  color: c === city ? '#fff' : '#000'
                }}
              >
                <p style={{
                  margin: 0,
                  position: 'relative'
                }}>{c}</p>
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
              style={type === t.name ? { filter: 'brightness(0) invert(1)' } : {}}
            />
            <p>{t.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
