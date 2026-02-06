import { useEffect, useState, useRef, useMemo } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { translations } from '../../utils/translations/translations';

// Import components
import Spinner from '../spinner/spinner.component';
import Card from '../card/card.component';
import Button from '../button/button.component';

// Import custom hook
import useSessionStorage from '../../utils/hooks/useSessionStorage';

// Import style
import './list.style.scss';

const List = ({ language, events, isLoading }) => {
  const [typeOfEvent, setTypeOfEvent] = useSessionStorage(
    'typeOfEvent',
    'births'
  );
  const [visibleCountByType, setVisibleCountByType] = useSessionStorage(
    'visibleCountByType',
    { births: 10, events: 10, holidays: 10 }
  );
  const [scrollYByType, setScrollYByType] = useSessionStorage(
    'scrollYByType',
    { births: 0, events: 0, holidays: 0 }
  );
  const listRef = useRef(null);
  const [columns, setColumns] = useState(5);
  const [rowHeight, setRowHeight] = useState(520);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const rowHeightRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);
  const restoredRef = useRef({});

  const t = translations[language] || translations.bs;

  // Sort by year
  const sortByYear = useMemo(
    () => (events?.[typeOfEvent] || []).slice().sort((a, b) => a.year - b.year),
    [events, typeOfEvent]
  );

  const totalCount = sortByYear.length;
  const currentVisibleCount = Math.min(
    visibleCountByType?.[typeOfEvent] ?? 10,
    totalCount
  );
  const visibleItems = sortByYear.slice(0, currentVisibleCount);
  const rowCount = Math.ceil(visibleItems.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => rowHeight || 520,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // Improve estimate size once by measuring a real row
  useEffect(() => {
    if (rowHeightRef.current) return;
    if (!listRef.current) return;
    const firstRow = listRef.current.querySelector('.list-row');
    if (!firstRow) return;
    const nextHeight = firstRow.getBoundingClientRect().height;
    if (nextHeight) {
      rowHeightRef.current = nextHeight;
      setRowHeight(nextHeight);
    }
  }, [virtualRows, columns, visibleItems.length]);

  // Ensure we have a default visible count for each type
  useEffect(() => {
    setVisibleCountByType((prev) => {
      if (prev?.[typeOfEvent] != null) return prev;
      return { ...prev, [typeOfEvent]: 10 };
    });
  }, [typeOfEvent, setVisibleCountByType]);

  // Keep columns in sync with responsive CSS
  useEffect(() => {
    if (!listRef.current) return;

    const updateColumns = (target) => {
      if (!(target instanceof Element)) return;
      const value = window
        .getComputedStyle(target)
        .getPropertyValue('--columns');
      const parsed = parseInt(value, 10);
      if (!Number.isNaN(parsed)) setColumns(parsed);
    };

    updateColumns(listRef.current);
    const observer = new ResizeObserver((entries) => {
      if (!entries?.length) return;
      updateColumns(entries[0].target);
    });
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);

  // Persist scroll position per type
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setScrollYByType((prev) => ({
        ...prev,
        [typeOfEvent]: window.scrollY,
      }));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [typeOfEvent, setScrollYByType]);

  // Ensure we store position when leaving the list
  useEffect(() => {
    return () => {
      setScrollYByType((prev) => ({
        ...prev,
        [typeOfEvent]: window.scrollY,
      }));
    };
  }, [typeOfEvent, setScrollYByType]);

  // Restore scroll position after data loads
  useEffect(() => {
    if (isLoading) return;
    if (restoredRef.current[typeOfEvent]) return;
    const savedY = scrollYByType?.[typeOfEvent] ?? 0;
    const targetY = savedY;
    if (!Number.isNaN(targetY)) window.scrollTo(0, targetY);
    restoredRef.current[typeOfEvent] = true;
  }, [isLoading, typeOfEvent, scrollYByType]);

  // Ensure the clicked card is rendered when returning to the list
  useEffect(() => {
    if (isLoading) return;
    const lastType = sessionStorage.getItem('lastClickedType');
    const lastId = sessionStorage.getItem('lastClickedPageId');
    const lastIndex = sessionStorage.getItem('lastClickedIndex');
    if (lastType !== typeOfEvent || !lastId || lastIndex == null) return;

    const targetIndex = Number(lastIndex);
    if (Number.isNaN(targetIndex)) return;
    if (targetIndex < 0) return;

    setIsRestoring(true);
    setVisibleCountByType((prev) => {
      const prevCount = prev?.[typeOfEvent] ?? 10;
      const neededCount = targetIndex + 1;
      const nextCount = Math.max(prevCount, neededCount);
      if (nextCount === prevCount) return prev;
      return { ...prev, [typeOfEvent]: nextCount };
    });
  }, [isLoading, sortByYear, typeOfEvent, setVisibleCountByType]);

  // Scroll to the clicked card after it is rendered
  useEffect(() => {
    if (!isRestoring) return;
    const lastType = sessionStorage.getItem('lastClickedType');
    const lastId = sessionStorage.getItem('lastClickedPageId');
    const lastIndex = sessionStorage.getItem('lastClickedIndex');
    if (lastType !== typeOfEvent || !lastId || lastIndex == null) {
      setIsRestoring(false);
      return;
    }

    const targetIndex = Number(lastIndex);
    if (Number.isNaN(targetIndex)) return;
    const rowIndex = Math.floor(targetIndex / columns);
    rowVirtualizer.scrollToIndex(rowIndex, { align: 'center' });

    const centerTarget = () => {
      const targetEl = listRef.current?.querySelector(
        `[data-pageid="${lastId}"]`
      );
      if (!targetEl) return false;

      targetEl.scrollIntoView({ block: 'center', behavior: 'auto' });
      const rect = targetEl.getBoundingClientRect();
      const delta = rect.top + rect.height / 2 - window.innerHeight / 2;
      if (Math.abs(delta) > 6) {
        window.scrollBy(0, delta);
      }
      return true;
    };

    requestAnimationFrame(() => {
      if (!centerTarget()) return;
      setTimeout(centerTarget, 120);
      setTimeout(centerTarget, 320);
    });

    sessionStorage.removeItem('lastClickedPageId');
    sessionStorage.removeItem('lastClickedType');
    sessionStorage.removeItem('lastClickedIndex');
    setIsRestoring(false);
  }, [isRestoring, visibleItems.length, typeOfEvent, columns, rowVirtualizer]);

  // Infinite load: increase in batches of 10 when near the end
  useEffect(() => {
    const lastRow = virtualRows[virtualRows.length - 1];
    if (!lastRow) return;
    if (!listRef.current) return;

    const containerTop = listRef.current.getBoundingClientRect().top;
    const containerOffset = containerTop + window.scrollY;
    const lastRowEnd = containerOffset + lastRow.end;
    const nearEnd =
      lastRowEnd - window.scrollY <
      window.innerHeight + Math.max(300, rowHeight);

    if (nearEnd && currentVisibleCount < totalCount && !isLoadingMore) {
      setIsLoadingMore(true);
      setVisibleCountByType((prev) => {
        const prevCount = prev?.[typeOfEvent] ?? 10;
        const nextCount = Math.min(prevCount + 10, totalCount);
        if (nextCount === prevCount) return prev;
        return { ...prev, [typeOfEvent]: nextCount };
      });
      setTimeout(() => setIsLoadingMore(false), 200);
    }
  }, [
    virtualRows,
    rowCount,
    currentVisibleCount,
    totalCount,
    typeOfEvent,
    setVisibleCountByType,
    scrollY,
    rowHeight,
    isLoadingMore,
  ]);

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
            <div
              className='list-spacer'
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {virtualRows.map((virtualRow) => {
                const startIndex = virtualRow.index * columns;
                const rowItems = visibleItems.slice(
                  startIndex,
                  startIndex + columns
                );

                return (
                  <div
                    key={virtualRow.key}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    className='list-row'
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {rowItems.map((el, index) => (
                      <Card
                        key={`${startIndex + index}-${el?.year}`}
                        data={el}
                        eventType={typeOfEvent}
                        itemIndex={startIndex + index}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          {currentVisibleCount < totalCount && (
            <div className='list-loading'>
              {isLoadingMore ? <Spinner variant='inline' /> : null}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default List;
