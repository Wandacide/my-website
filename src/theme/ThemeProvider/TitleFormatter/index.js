import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {TitleFormatterProvider} from '@docusaurus/theme-common/internal';

export default function ThemeProviderTitleFormatter({children}) {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();

  const formatter = (params) => {
    if (currentLocale !== 'en') {
      return params.defaultFormatter(params);
    }

    const englishSiteTitle = 'Liangongbao Help Center';
    const title = params.title?.trim();

    if (!title || title === params.siteTitle || title === englishSiteTitle) {
      return englishSiteTitle;
    }

    return `${title} ${params.titleDelimiter} ${englishSiteTitle}`;
  };

  return (
    <TitleFormatterProvider formatter={formatter}>
      {children}
    </TitleFormatterProvider>
  );
}
