import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  useDocById,
  findFirstSidebarItemLink,
} from '@docusaurus/plugin-content-docs/client';
import {
  extractLeadingEmoji,
  useDocCardDescriptionCategoryItemsPlural,
} from '@docusaurus/theme-common/internal';
import isInternalUrl from '@docusaurus/isInternalUrl';
import Layout from '@theme/DocCard/Layout';
import docCardDescriptions from '@site/src/data/docCardDescriptions';

function getFallbackEmojiIcon(item) {
  if (item.type === 'category') {
    return '🗂️';
  }
  return isInternalUrl(item.href) ? '📄️' : '🔗';
}

function getIconTitleProps(item) {
  const extracted = extractLeadingEmoji(item.label);
  const emoji = extracted.emoji ?? getFallbackEmojiIcon(item);
  return {
    icon: emoji,
    title: extracted.rest.trim(),
  };
}

function getCustomDescription(item) {
  const title = getIconTitleProps(item).title;
  return (
    docCardDescriptions[item.docId] ??
    docCardDescriptions[item.href] ??
    docCardDescriptions[item.label] ??
    docCardDescriptions[title]
  );
}

function CardCategory({item}) {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const href = findFirstSidebarItemLink(item);
  const categoryItemsPlural = useDocCardDescriptionCategoryItemsPlural();
  const shouldHideDescription = currentLocale === 'en';

  if (!href) {
    return null;
  }

  return (
    <Layout
      item={item}
      className={item.className}
      href={href}
      description={
        shouldHideDescription
          ? undefined
          : getCustomDescription(item) ??
            item.description ??
            categoryItemsPlural(item.items.length)
      }
      {...getIconTitleProps(item)}
    />
  );
}

function CardLink({item}) {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const doc = useDocById(item.docId ?? undefined);
  const shouldHideDescription = currentLocale === 'en';

  return (
    <Layout
      item={item}
      className={item.className}
      href={item.href}
      description={
        shouldHideDescription
          ? undefined
          : getCustomDescription(item) ?? item.description ?? doc?.description
      }
      {...getIconTitleProps(item)}
    />
  );
}

export default function DocCard({item}) {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
