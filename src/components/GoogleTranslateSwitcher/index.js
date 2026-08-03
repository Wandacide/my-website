import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import './styles.css';

function normalizeBasePath(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function stripBasePath(pathname, baseUrl) {
  const basePath = normalizeBasePath(baseUrl);

  if (pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length - 1) || '/';
  }

  return pathname || '/';
}

function stripLocalePath(pathname, locale) {
  if (locale === 'en' && (pathname === '/en' || pathname.startsWith('/en/'))) {
    return pathname.slice('/en'.length) || '/';
  }

  return pathname;
}

function getRootBasePath(baseUrl, currentLocale) {
  const basePath = normalizeBasePath(baseUrl).replace(/\/$/, '');

  if (currentLocale === 'en' && basePath.endsWith('/en')) {
    return basePath.slice(0, -'/en'.length) || '';
  }

  return basePath;
}

function createLocalizedPath({pathname, baseUrl, currentLocale, targetLocale}) {
  const rootBasePath = getRootBasePath(baseUrl, currentLocale);
  const pathnameWithoutBase = stripBasePath(pathname, baseUrl);
  const contentPath = stripLocalePath(pathnameWithoutBase, currentLocale);

  if (targetLocale === 'en') {
    return `${rootBasePath}/en${contentPath === '/' ? '/' : contentPath}`;
  }

  return `${rootBasePath}${contentPath}`;
}

export default function GoogleTranslateSwitcher() {
  const {
    siteConfig: {baseUrl},
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const {pathname, search, hash} = useLocation();
  const targetLocale = currentLocale === 'en' ? 'zh-CN' : 'en';
  const label = targetLocale === 'en' ? 'EN' : '中文';
  const title = targetLocale === 'en' ? 'Switch to English' : 'Switch to Chinese';
  const targetUrl = `${createLocalizedPath({
    pathname,
    baseUrl,
    currentLocale,
    targetLocale,
  })}${search}${hash}`;

  return (
    <div className="google-translate-switcher">
      <a
        href={targetUrl}
        className="google-translate-switcher__button"
        aria-label={title}
        title={title}>
        <span className="google-translate-switcher__label">{label}</span>
      </a>
    </div>
  );
}
