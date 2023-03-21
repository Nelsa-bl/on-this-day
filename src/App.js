// Import components
import List from './components/list/list.component';
import { year, month, day, weekday } from './utils/date/date';

const App = () => {
  const weekDayFirstUpperCase =
    weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return (
    <div className='App'>
      <h2>Dogodilo se na današnji dan</h2>
      <p style={{ marginTop: '-10px' }}>
        ({weekDayFirstUpperCase}, {day}/{month}/{year})
      </p>
      <List />
    </div>
  );
};

export default App;
