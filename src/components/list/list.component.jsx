import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { translations } from '../../utils/translations/translations';
import {
  CATEGORY_OPTIONS,
  categorizeEvent,
} from '../../utils/events/eventMeta';

import Spinner from '../spinner/spinner.component';
import Card from '../card/card.component';
import Button from '../button/button.component';
import useSessionStorage from '../../utils/hooks/useSessionStorage';

import './list.style.scss';

const DEFAULT_SCROLL = { births: 0, events: 0, holidays: 0 };

const List = ({ language, events, isLoading, hasFetched, error, onRetry }) => {
  const navigate = useNavigate();
  const [typeOfEvent, setTypeOfEvent] = useSessionStorage(
    'typeOfEvent',
    'births',
  );
  const [viewMode, setViewMode] = useSessionStorage('viewMode', 'grid');
  const [categoryFilter, setCategoryFilter] = useSessionStorage(
    'categoryFilter',
    'all',
  );
  const [scrollYByType, setScrollYByType] = useSessionStorage(
    'scrollYByType',
    DEFAULT_SCROLL,
  );

  const listRef = useRef(null);
  const restoredRef = useRef({});
  const [columns, setColumns] = useState(5);
  const [isRestoring, setIsRestoring] = useState(false);

  const t = translations[language] || translations.bs;
  const getCategoryLabel = (key) =>
    key === 'all' ? t.allCategories || 'All' : t[key] || key;

  const sortByYear = useMemo(
    () => (events?.[typeOfEvent] || []).slice().sort((a, b) => a.year - b.year),
    [events, typeOfEvent],
  );

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') return sortByYear;
    return sortByYear.filter(
      (event) => categorizeEvent(event) === categoryFilter,
    );
  }, [categoryFilter, sortByYear]);

  const visibleItems = filteredItems;
  const rowCount = Math.ceil(visibleItems.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 520,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const openEvent = (event, type = typeOfEvent, itemIndex = 0) => {
    const page = event?.pages?.[0];
    if (!page?.pageid) return;
    sessionStorage.setItem('lastClickedPageId', String(page.pageid));
    sessionStorage.setItem('lastClickedType', String(type));
    sessionStorage.setItem('lastClickedIndex', String(itemIndex));
    sessionStorage.setItem('lastClickedScrollY', String(window.scrollY || 0));

    navigate(`/event/${type}/${page.pageid}`, {
      state: { event, eventType: type, wikiPage: page },
    });
  };

  const randomSurprise = () => {
    const pools = ['births', 'events', 'holidays']
      .map((type) => ({
        type,
        items: events?.[type] || [],
      }))
      .filter((pool) => pool.items.length > 0);

    if (!pools.length) return;

    const selectedPool = pools[Math.floor(Math.random() * pools.length)];
    const selectedIndex = Math.floor(Math.random() * selectedPool.items.length);
    const selectedEvent = selectedPool.items[selectedIndex];

    setTypeOfEvent(selectedPool.type);
    setCategoryFilter('all');
    openEvent(selectedEvent, selectedPool.type, selectedIndex);
  };

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
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollYByType((prev) => ({
        ...prev,
        [typeOfEvent]: window.scrollY,
      }));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [typeOfEvent, setScrollYByType]);

  useEffect(() => {
    return () => {
      setScrollYByType((prev) => ({
        ...prev,
        [typeOfEvent]: window.scrollY,
      }));
    };
  }, [typeOfEvent, setScrollYByType]);

  // Single scroll restoration path to avoid jump on back navigation.
  useEffect(() => {
    if (isLoading) return;
    if (restoredRef.current[typeOfEvent]) return;
    const lastType = sessionStorage.getItem('lastClickedType');
    const lastId = sessionStorage.getItem('lastClickedPageId');
    const lastIndex = sessionStorage.getItem('lastClickedIndex');
    if (lastType === typeOfEvent && lastId && lastIndex != null) {
      return;
    }
    const savedY = scrollYByType?.[typeOfEvent] ?? 0;
    if (!Number.isNaN(savedY)) window.scrollTo(0, savedY);
    restoredRef.current[typeOfEvent] = true;
  }, [isLoading, typeOfEvent, scrollYByType]);

  useEffect(() => {
    if (isLoading) return;
    const lastType = sessionStorage.getItem('lastClickedType');
    const lastId = sessionStorage.getItem('lastClickedPageId');
    const lastIndex = Number(sessionStorage.getItem('lastClickedIndex'));
    const lastScrollY = Number(sessionStorage.getItem('lastClickedScrollY'));
    if (lastType !== typeOfEvent || !lastId || Number.isNaN(lastIndex)) {
      return;
    }

    // Desktop: restore exact previous viewport for smoother return.
    if (window.innerWidth > 768 && !Number.isNaN(lastScrollY)) {
      window.scrollTo(0, lastScrollY);
      restoredRef.current[typeOfEvent] = true;
      sessionStorage.removeItem('lastClickedPageId');
      sessionStorage.removeItem('lastClickedType');
      sessionStorage.removeItem('lastClickedIndex');
      sessionStorage.removeItem('lastClickedScrollY');
      return;
    }

    if (lastIndex < 0) return;
    setIsRestoring(true);
  }, [isLoading, typeOfEvent]);

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
    if (Number.isNaN(targetIndex)) {
      setIsRestoring(false);
      return;
    }

    if (viewMode === 'grid') {
      const rowIndex = Math.floor(targetIndex / columns);
      rowVirtualizer.scrollToIndex(rowIndex, { align: 'center' });
    }

    const centerTarget = () => {
      const targetEl = listRef.current?.querySelector(`[data-pageid="${lastId}"]`);
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
    sessionStorage.removeItem('lastClickedScrollY');
    setIsRestoring(false);
  }, [isRestoring, visibleItems.length, typeOfEvent, columns, rowVirtualizer, viewMode]);

  return (
    <>
      {isLoading || !hasFetched ? (
        <Spinner />
      ) : (
        <>
          {error ? (
            <div className='list-error'>
              <p>{t.fetchFailed}</p>
              <button className='btn-small btn-active' onClick={onRetry}>
                {t.retry}
              </button>
            </div>
          ) : null}

          <div className='sort-container'>
            <div className='sort-top-row'>
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
              <button
                className='btn-small random-surprise-btn'
                onClick={randomSurprise}
              >
                {t.randomSurprise}
              </button>
            </div>

            <div className='filters-panel single-row'>
              <div className='category-filter'>
                <div className='category-header'>
                  <span className='filters-title'>{t.category}</span>
                  <div
                    className='view-toggle-icons'
                    role='group'
                    aria-label='View mode'
                  >
                    <button
                      className={`icon-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      aria-label={t.grid}
                      title={t.grid}
                    >
                      <svg viewBox='0 0 24 24' aria-hidden='true'>
                        <path d='M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z' />
                      </svg>
                    </button>
                    <button
                      className={`icon-toggle ${viewMode === 'timeline' ? 'active' : ''}`}
                      onClick={() => setViewMode('timeline')}
                      aria-label={t.timeline}
                      title={t.timeline}
                    >
                      <svg viewBox='0 0 24 24' aria-hidden='true'>
                        <path d='M11 3h2v18h-2V3ZM5 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className='category-mobile-select-wrap'>
                  <select
                    className='category-mobile-select'
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label={t.category}
                  >
                    {CATEGORY_OPTIONS.map((key) => (
                      <option key={key} value={key}>
                        {getCategoryLabel(key)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='category-chips'>
                  {CATEGORY_OPTIONS.map((key) => (
                    <button
                      key={key}
                      className={`category-chip ${
                        categoryFilter === key ? 'active' : ''
                      }`}
                      onClick={() => setCategoryFilter(key)}
                    >
                      {getCategoryLabel(key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className='list-empty'>
              <h3>{t.noCategoryMatches}</h3>
              <p>{t.tryAnotherCategory}</p>
            </div>
          ) : (
            <div className='list-container' ref={listRef}>
              {viewMode === 'grid' ? (
                <div
                  className='list-spacer'
                  style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                >
                  {virtualRows.map((virtualRow) => {
                    const startIndex = virtualRow.index * columns;
                    const rowItems = visibleItems.slice(
                      startIndex,
                      startIndex + columns,
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
              ) : (
                <div className='timeline-vertical'>
                  {visibleItems.map((el, index) => {
                    const page = el?.pages?.[0];
                    const category = categorizeEvent(el);
                    const side = index % 2 === 0 ? 'left' : 'right';
                    return (
                      <button
                        key={`${el?.year}-${page?.pageid || index}`}
                        className={`timeline-node timeline-node--${side}`}
                        data-pageid={page?.pageid}
                        onClick={() => openEvent(el, typeOfEvent, index)}
                      >
                        <span className='timeline-year-pill'>{el.year}</span>
                        {page?.thumbnail?.source ? (
                          <span
                            className='timeline-marker timeline-marker--image'
                            aria-hidden='true'
                          >
                            <img src={page.thumbnail.source} alt='' />
                          </span>
                        ) : (
                          <span className='timeline-marker' aria-hidden='true'>
                            <svg viewBox='0 0 24 24'>
                              <path d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z' />
                            </svg>
                          </span>
                        )}
                        <div className='timeline-content-card'>
                          <h3>{page?.titles?.normalized || el.text}</h3>
                          <span className='timeline-category'>
                            {t[category] || category}
                          </span>
                          <p>{el.text}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default List;
