import {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Fuse from 'fuse.js';
import searchIndex from '../data/searchIndex';
import styles from './index.module.css';

const SEARCH_HISTORY_STORAGE_KEY = 'liangongbao-help-search-history';
const DEFAULT_SEARCH_HISTORY = ['账号', '登录', '密码', '角色', '权限'];

const fuse = new Fuse(searchIndex, {
  keys: [
    {name: 'title', weight: 0.6},
    {name: 'tags', weight: 0.25},
    {name: 'description', weight: 0.1},
    {name: 'queries', weight: 0.05},
  ],
  threshold: 0.6,
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  minMatchCharLength: 1,
  useExtendedSearch: true,
});

const helpCards = [
  {
    title: '账号设置',
    description: '登录平台、创建账号、账号管理与角色权限配置。',
    to: '/docs/category/账号设置',
  },
  {
    title: '组织管理',
    description: '维护部门、岗位与员工信息，搭建清晰组织架构。',
    to: '/docs/category/组织管理',
  },
  {
    title: '培训任务',
    description: '创建培训计划、导入学员并持续追踪学习进度。',
    to: '/docs/category/培训任务',
  },
  {
    title: '学习中心',
    description: '管理课程、题库、考试、讲师与教室资源。',
    to: '/docs/category/学习中心',
  },
  {
    title: '积分规则',
    description: '配置学习积分规则，激励员工完成安全培训。',
    to: '/docs/category/积分规则',
  },
  {
    title: '档案与合规',
    description: '查看一人一档、学时证明与任务合格证明。',
    to: '/docs/category/档案与合规',
  },
];

function normalizeKeyword(value) {
  return value.trim().toLowerCase();
}

function highlightMatch(text, keyword, matches) {
  if (matches && matches.length > 0) {
    const titleMatch = matches.find((m) => m.key === 'title' || m.value === text);

    if (titleMatch && titleMatch.indices && titleMatch.indices.length > 0) {
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

        parts.push(<mark className={styles.searchHighlight} key={`hl-${start}`}>{text.slice(start, end + 1)}</mark>);
        cursor = end + 1;
      }

      if (cursor < text.length) {
        parts.push(text.slice(cursor));
      }

      return <>{parts}</>;
    }
  }

  // 回退到 V1 简单匹配（无 Fuse matches 时）
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
      <mark className={styles.searchHighlight}>{text.slice(matchIndex, matchEnd)}</mark>
      {text.slice(matchEnd)}
    </>
  );
}

function searchArticles(keyword) {
  const normalizedKeyword = normalizeKeyword(keyword);

  if (!normalizedKeyword) {
    return [];
  }

  return fuse
    .search(normalizedKeyword)
    .map((result) => ({
      ...result.item,
      score: 1 - result.score,
      matches: result.matches,
    }))
    .slice(0, 5);
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

function HomepageHeader() {
  const [keyword, setKeyword] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState(DEFAULT_SEARCH_HISTORY);
  const results = useMemo(() => searchArticles(keyword), [keyword]);
  const hasKeyword = normalizeKeyword(keyword).length > 0;
  const shouldShowSearchHistory = isSearchFocused && !hasKeyword;

  useEffect(() => {
    setSearchHistory(getStoredSearchHistory());
  }, []);

  function handleKeywordChange(event) {
    setKeyword(event.target.value);
    setActiveIndex(0);
  }

  function clearKeyword() {
    setKeyword('');
    setActiveIndex(0);
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
    saveSearchKeyword(value);
  }

  function removeHistoryKeyword(value) {
    const nextHistory = searchHistory.filter((item) => normalizeKeyword(item) !== normalizeKeyword(value));

    setSearchHistory(nextHistory);
    saveStoredSearchHistory(nextHistory);
  }

  function handleResultClick() {
    saveSearchKeyword(keyword);
  }

  function handleKeyDown(event) {
    if (!hasKeyword || results.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex + 1) % results.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex - 1 + results.length) % results.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      return;
    }

    if (event.key === 'Escape') {
      clearKeyword();
    }
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroGlow} />
      <div className={styles.heroInner}>
        <span className={styles.badge}>链工宝帮助中心</span>
        <Heading as="h1" className={styles.heroTitle}>
          有什么可以帮你？
        </Heading>
        <div className={styles.searchArea} role="search">
          <div className={styles.searchBox}>
            <span className={styles.searchIcon} aria-hidden="true">
              ⌕
            </span>
            <input
              className={styles.searchInput}
              type="text"
              value={keyword}
              onChange={handleKeywordChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
              placeholder="请输入关键词，如：创建账号、重置密码、菜单权限"
              aria-label="搜索链工宝帮助文档"
              aria-expanded={hasKeyword || shouldShowSearchHistory}
              aria-controls="homepage-search-results"
              aria-activedescendant={hasKeyword && results[activeIndex] ? `search-result-${activeIndex}` : undefined}
            />
            {hasKeyword && (
              <button className={styles.searchClear} type="button" onClick={clearKeyword} aria-label="清空搜索关键词">
                ×
              </button>
            )}
          </div>
          {shouldShowSearchHistory && (
            <div className={styles.searchSuggestPanel} id="homepage-search-results">
              <span className={styles.searchSuggestTitle}>搜索历史</span>
              <div className={styles.searchHistoryList}>
                {searchHistory.length > 0 ? (
                  searchHistory.map((historyItem) => (
                    <div className={styles.searchHistoryItem} key={historyItem}>
                      <button
                        className={styles.searchHistoryKeyword}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectHistoryKeyword(historyItem)}>
                        {historyItem}
                      </button>
                      <button
                        className={styles.searchHistoryRemove}
                        type="button"
                        aria-label={`删除搜索历史：${historyItem}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => removeHistoryKeyword(historyItem)}>
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.searchHistoryEmpty}>暂无搜索历史</div>
                )}
              </div>
            </div>
          )}
          {hasKeyword && (
            <div className={styles.searchResults} id="homepage-search-results" role="listbox">
              {results.length > 0 ? (
                results.map((article, index) => (
                  <Link
                    className={`${styles.searchResultItem} ${index === activeIndex ? styles.searchResultItemActive : ''}`}
                    id={`search-result-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    to={article.url}
                    onClick={handleResultClick}
                    key={article.url}>
                    <span className={styles.searchResultTitle}>{highlightMatch(article.title, keyword, article.matches)}</span>
                  </Link>
                ))
              ) : (
                <div className={styles.searchEmpty}>
                  <strong>没有找到相关文档</strong>
                  <span>试试搜索：账号、角色、密码、权限</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HelpCard({title, description, to}) {
  return (
    <Link className={styles.card} to={to}>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
}

export default function Home() {
  return (
    <Layout
      title="链工宝帮助中心"
      description="链工宝账号设置、组织管理、培训任务、学习中心、积分规则、档案与合规帮助中心">
      <HomepageHeader />
      <main className={styles.main}>
        <section className={styles.usageSection}>
          <div className={styles.sectionHeader}>
            <Heading as="h2">使用链工宝</Heading>
            <p>选择你要处理的业务场景，快速进入对应帮助文档。</p>
          </div>
          <div className={styles.cardGrid}>
            {helpCards.map((card) => (
              <HelpCard key={card.title} {...card} />
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
