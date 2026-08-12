import React, {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Fuse from 'fuse.js';
import {Clock3, FileText, Search, X} from 'lucide-react';
import searchIndex from '@site/src/data/searchIndex';
import styles from './index.module.css';

const SEARCH_HISTORY_STORAGE_KEY = 'liangongbao-help-search-history';
const DEFAULT_SEARCH_HISTORY = ['账号', '登录', '密码', '角色', '权限'];
const MAX_SEARCH_RESULTS = 8;
const MAX_SEARCH_RESULTS_PER_PAGE = 3;

function buildQuestionIndex(docs) {
  return docs.flatMap((doc) => {
    const questions = doc.queries?.length ? doc.queries : [doc.title];

    return questions.map((question, index) => ({
      id: `${doc.url}-${index}`,
      question,
      docTitle: doc.title,
      category: doc.category,
      tags: doc.tags || [],
      description: doc.description || '',
      url: doc.url,
    }));
  });
}

const questionIndex = buildQuestionIndex(searchIndex);

const questionFuse = new Fuse(questionIndex, {
  keys: [
    {name: 'question', weight: 0.7},
    {name: 'tags', weight: 0.25},
    {name: 'docTitle', weight: 0.18},
    {name: 'category', weight: 0.12},
    {name: 'description', weight: 0.08},
  ],
  threshold: 0.6,
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  minMatchCharLength: 1,
  useExtendedSearch: true,
});

function normalizeKeyword(value) {
  return value.trim().toLowerCase();
}

function highlightMatch(text, keyword, matches) {
  if (matches && matches.length > 0) {
    const titleMatch = matches.find((match) => match.key === 'question' || match.value === text);

    if (titleMatch?.indices?.length > 0) {
      const mergedIndices = [];
      const sorted = [...titleMatch.indices].sort((a, b) => a[0] - b[0]);

      for (const [start, end] of sorted) {
        if (mergedIndices.length > 0 && start <= mergedIndices[mergedIndices.length - 1][1] + 1) {
          mergedIndices[mergedIndices.length - 1][1] = Math.max(mergedIndices[mergedIndices.length - 1][1], end);
        } else {
          mergedIndices.push([start, end]);
        }
      }

      const parts = [];
      let cursor = 0;

      for (const [start, end] of mergedIndices) {
        if (start > cursor) {
          parts.push(text.slice(cursor, start));
        }

        parts.push(
          <mark className="rounded bg-amber-100 px-0.5 text-blue-700" key={`hl-${start}`}>
            {text.slice(start, end + 1)}
          </mark>,
        );
        cursor = end + 1;
      }

      if (cursor < text.length) {
        parts.push(text.slice(cursor));
      }

      return <>{parts}</>;
    }
  }

  const normalizedKeyword = normalizeKeyword(keyword);
  const normalizedText = normalizeKeyword(text);
  const matchIndex = normalizedText.indexOf(normalizedKeyword);

  if (!normalizedKeyword || matchIndex < 0) {
    return text;
  }

  const matchEnd = matchIndex + normalizedKeyword.length;

  return (
    <>
      {text.slice(0, matchIndex)}
      <mark className="rounded bg-amber-100 px-0.5 text-blue-700">{text.slice(matchIndex, matchEnd)}</mark>
      {text.slice(matchEnd)}
    </>
  );
}

function searchQuestions(keyword) {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return {
      results: [],
      resultCount: 0,
    };
  }

  const pageResultCounts = new Map();
  const results = [];
  const fuseResults = questionFuse.search(normalizedKeyword);

  for (const result of fuseResults.map((item) => ({
    ...item.item,
    score: 1 - item.score,
    matches: item.matches,
  }))) {
    const pageResultCount = pageResultCounts.get(result.url) || 0;

    if (pageResultCount >= MAX_SEARCH_RESULTS_PER_PAGE) {
      continue;
    }

    pageResultCounts.set(result.url, pageResultCount + 1);
    results.push(result);

    if (results.length >= MAX_SEARCH_RESULTS) {
      break;
    }
  }

  return {
    results,
    resultCount: fuseResults.length,
  };
}

function sendGaSearchEvent(searchTerm, resultCount) {
  const normalizedSearchTerm = typeof searchTerm === 'string' ? searchTerm.trim() : '';

  if (!normalizedSearchTerm || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'search', {
    search_term: normalizedSearchTerm,
    result_count: resultCount,
  });

  if (resultCount === 0) {
    window.gtag('event', 'search_no_result', {
      search_term: normalizedSearchTerm,
    });
  }
}

function getStoredSearchHistory() {
  if (typeof window === 'undefined') {
    return DEFAULT_SEARCH_HISTORY;
  }

  try {
    const storedHistory = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);

    if (storedHistory === null) {
      return DEFAULT_SEARCH_HISTORY;
    }

    const parsedHistory = JSON.parse(storedHistory);

    if (!Array.isArray(parsedHistory)) {
      return DEFAULT_SEARCH_HISTORY;
    }

    return parsedHistory.filter((item) => typeof item === 'string' && item.trim()).slice(0, 5);
  } catch {
    return DEFAULT_SEARCH_HISTORY;
  }
}

function saveStoredSearchHistory(history) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 5)));
}

function SearchClearButton({label, onClear}) {
  return (
    <button
      className={styles.clearButton}
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClear}
      aria-label={label}>
      <span className={styles.clearIcon} aria-hidden="true">
        <span />
        <span />
      </span>
    </button>
  );
}

export default function HeroSearch({content, showSearch}) {
  const [keyword, setKeyword] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState(DEFAULT_SEARCH_HISTORY);
  const searchAreaRef = useRef(null);
  const lastTrackedSearchTermRef = useRef('');
  const searchState = useMemo(() => searchQuestions(keyword), [keyword]);
  const {results, resultCount} = searchState;
  const hasKeyword = normalizeKeyword(keyword).length > 0;
  const shouldShowSearchHistory = isSearchFocused && !hasKeyword;
  const searchPanelId = hasKeyword ? 'homepage-search-results' : 'homepage-search-history';

  useEffect(() => {
    setSearchHistory(getStoredSearchHistory());
  }, []);

  useEffect(() => {
    setActiveIndex((currentIndex) => Math.min(currentIndex, Math.max(results.length - 1, 0)));
  }, [results.length]);

  function handleKeywordChange(event) {
    setKeyword(event.target.value);
    setActiveIndex(0);
    lastTrackedSearchTermRef.current = '';
  }

  function clearKeyword() {
    setKeyword('');
    setActiveIndex(0);
    lastTrackedSearchTermRef.current = '';
  }

  function trackSearchEvent(searchTerm) {
    const normalizedSearchTerm = typeof searchTerm === 'string' ? searchTerm.trim() : '';

    if (!normalizedSearchTerm || normalizedSearchTerm === lastTrackedSearchTermRef.current) {
      return;
    }

    lastTrackedSearchTermRef.current = normalizedSearchTerm;
    sendGaSearchEvent(normalizedSearchTerm, resultCount);
  }

  function saveSearchKeyword(value) {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return;
    }

    const nextHistory = [
      normalizedValue,
      ...searchHistory.filter((item) => normalizeKeyword(item) !== normalizeKeyword(normalizedValue)),
    ].slice(0, 5);

    setSearchHistory(nextHistory);
    saveStoredSearchHistory(nextHistory);
  }

  function selectHistoryKeyword(value) {
    setKeyword(value);
    setActiveIndex(0);
    lastTrackedSearchTermRef.current = '';
    saveSearchKeyword(value);
  }

  function removeHistoryKeyword(value) {
    const nextHistory = searchHistory.filter((item) => normalizeKeyword(item) !== normalizeKeyword(value));

    setSearchHistory(nextHistory);
    saveStoredSearchHistory(nextHistory);
  }

  function handleResultClick() {
    saveSearchKeyword(keyword);
    trackSearchEvent(keyword);
  }

  function handleSearchBlur(event) {
    const nextFocusedElement = event.relatedTarget;
    const shouldTrackSearch = !nextFocusedElement || !searchAreaRef.current?.contains(nextFocusedElement);

    window.setTimeout(() => {
      setIsSearchFocused(false);

      if (shouldTrackSearch) {
        trackSearchEvent(keyword);
      }
    }, 120);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      if (!hasKeyword || results.length === 0) {
        return;
      }

      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex + 1) % results.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!hasKeyword || results.length === 0) {
        return;
      }

      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex - 1 + results.length) % results.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (hasKeyword) {
        saveSearchKeyword(keyword);
      }

      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      clearKeyword();
    }
  }

  return (
    <section className="relative overflow-visible bg-[linear-gradient(180deg,#f6f9ff_0%,#eef5ff_52%,#ffffff_100%)] pb-8 pt-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-md border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
            {content.badge}
          </span>
          <Heading as="h1" className="mb-0 mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            {content.title}
          </Heading>
          <p className="mt-3 max-w-none text-base leading-7 text-slate-600 sm:text-lg lg:whitespace-nowrap">{content.description}</p>
          {showSearch && (
            <div className="relative mt-5 w-full max-w-2xl" role="search" ref={searchAreaRef}>
              <div className="flex h-14 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-xl shadow-blue-950/10 ring-1 ring-white">
                <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:outline-none"
                  type="text"
                  value={keyword}
                  onChange={handleKeywordChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={handleSearchBlur}
                  placeholder={content.searchPlaceholder}
                  aria-label={content.searchAriaLabel}
                  aria-expanded={hasKeyword || shouldShowSearchHistory}
                  aria-controls={searchPanelId}
                  aria-activedescendant={hasKeyword && results[activeIndex] ? `search-result-${activeIndex}` : undefined}
                />
                {hasKeyword && (
                  <SearchClearButton label={content.clearSearchLabel} onClear={clearKeyword} />
                )}
              </div>

              {shouldShowSearchHistory && (
                <div className="absolute left-0 top-[calc(100%+0.75rem)] z-20 w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-3 text-left shadow-2xl shadow-slate-900/12" id="homepage-search-history">
                  <span className="block px-4 pb-2 text-xs font-semibold text-slate-500">{content.searchHistoryTitle}</span>
                  <div className="flex flex-col">
                    {searchHistory.length > 0 ? (
                      searchHistory.map((historyItem) => (
                        <div className="flex min-h-11 items-center justify-between gap-3 px-4 transition hover:bg-slate-50" key={historyItem}>
                          <button
                            className="inline-flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent py-2 text-left text-sm font-semibold text-slate-800"
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectHistoryKeyword(historyItem)}>
                            <Clock3 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                            <span className="truncate">{historyItem}</span>
                          </button>
                          <button
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            type="button"
                            aria-label={`${content.removeHistoryLabel}${historyItem}`}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => removeHistoryKeyword(historyItem)}>
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-slate-500">{content.searchHistoryEmpty}</div>
                    )}
                  </div>
                </div>
              )}

              {hasKeyword && (
                <div className="absolute left-0 top-[calc(100%+0.75rem)] z-20 max-h-[420px] w-full overflow-auto rounded-lg border border-slate-200 bg-white text-left shadow-2xl shadow-slate-900/12" id="homepage-search-results" role="listbox">
                  {results.length > 0 ? (
                    results.map((result, index) => (
                      <Link
                        className={`block border-b border-slate-100 px-4 py-3 text-slate-900 no-underline transition last:border-b-0 hover:bg-blue-50/70 hover:text-slate-900 hover:no-underline ${index === activeIndex ? 'bg-blue-50/70' : ''}`}
                        id={`search-result-${index}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        to={result.url}
                        onClick={handleResultClick}
                        key={result.id}>
                        <span className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">
                            {result.category} / {result.docTitle}
                          </span>
                        </span>
                        <span className="block text-sm font-semibold leading-6 text-slate-950">
                          {highlightMatch(result.question, keyword, result.matches)}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="flex min-h-28 flex-col items-center justify-center gap-1 px-4 py-5 text-center text-sm text-slate-500">
                      <strong className="text-sm text-slate-800">{content.noResultsTitle}</strong>
                      <span>{content.noResultsDescription}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
