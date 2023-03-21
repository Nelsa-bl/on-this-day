import { useEffect, useState, useCallback } from 'react';

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

const List = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typeOfEvent, setTypeOfEvent] = useSessionStorage(
    'typeOfEvent',
    'births'
  );

  // Get Data
  const getDataMap = async () => {
    try {
      setIsLoading(true);
      const data = await getData();
      setEvents(data);
      setIsLoading(false);
      console.log('Data', data);
    } catch (err) {
      // If error then show message
      console.error(err.message);
    }
  };

  // Call getDataMap
  useEffect(() => {
    getDataMap();
  }, []);

  // Sort by year
  const sortByYear = events?.[typeOfEvent]?.sort((a, b) => a.year - b.year);

  // Handle click
  const handleShowTypeOfEvent = useCallback(
    (type) => () => {
      setTypeOfEvent(type);
    },
    []
  );

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
              Rođeni
            </Button>
            <Button
              eventType='events'
              activeType={typeOfEvent}
              onClick={setTypeOfEvent}
              style={{ marginLeft: '5px' }}
            >
              Događaji
            </Button>
          </div>
          <div className='list-container'>
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
