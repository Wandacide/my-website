import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function FooterCopyright({copyright}) {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const localizedCopyright =
    currentLocale === 'en'
      ? `Copyright © ${new Date().getFullYear()} Liangongbao Help Center.`
      : copyright;

  return (
    <div
      className="footer__copyright"
      // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: localizedCopyright}}
    />
  );
}
