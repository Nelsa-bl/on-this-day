import { useEffect, useState, useRef } from 'react';
import { translations } from '../../utils/translations/translations';

// Import data
import { getData } from '../../utils/apis/api';

// Import components
import Spinner from '../spinner/spinner.component';
import Card from '../card/card.component';
import Button from '../button/button.component';

// Import custom hook
import useSessionStorage from '../../utils/hooks/useSessionStorage';

// Import style
import './list.style.scss';

const List = ({ language }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typeOfEvent, setTypeOfEvent] = useSessionStorage(
    'typeOfEvent',
    'births'
  );
  const listRef = useRef(null);

  const t = translations[language] || translations.bs;

  // Get Data
  const getDataMap = async () => {
    try {
      setIsLoading(true);
      const data = await getData(language);
      setEvents(data);
      setIsLoading(false);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Call getDataMap
  useEffect(() => {
    getDataMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Sort by year
  const sortByYear = events?.[typeOfEvent]?.sort((a, b) => a.year - b.year);

  // Set all .name heights to the tallest one after rendering
  useEffect(() => {
    if (!listRef.current) return;
    const nameEls = Array.from(listRef.current.querySelectorAll('.name'));
    const grid = window.getComputedStyle(listRef.current);
    const columns = grid
      .getPropertyValue('grid-template-columns')
      .split(' ').length;

    // Reset all heights first
    nameEls.forEach((el) => (el.style.height = 'auto'));

    for (let i = 0; i < nameEls.length; i += columns) {
      const rowEls = nameEls.slice(i, i + columns);
      let maxHeight = 0;
      rowEls.forEach((el) => {
        if (el.offsetHeight > maxHeight) maxHeight = el.offsetHeight;
      });
      rowEls.forEach((el) => {
        el.style.height = `${maxHeight}px`;
      });
    }
  }, [sortByYear, typeOfEvent, isLoading]);

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className='sort-container'>
            <Button
              eventType='births'
              activeType={typeOfEvent}
              onClick={setTypeOfEvent}
            >
              {t.births}
            </Button>
            <Button
              eventType='events'
              activeType={typeOfEvent}
              onClick={setTypeOfEvent}
              style={{ marginLeft: '5px' }}
            >
              {t.events}
            </Button>
            <Button
              eventType='holidays'
              activeType={typeOfEvent}
              onClick={setTypeOfEvent}
              style={{ marginLeft: '5px' }}
            >
              {t.holidays}
            </Button>
          </div>
          <div className='list-container' ref={listRef}>
            {(sortByYear || []).map((el, index) => (
              <Card key={index} data={el} />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default List;
