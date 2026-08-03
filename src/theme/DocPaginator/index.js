import React from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import PaginatorNavLink from '@theme/PaginatorNavLink';

export default function DocPaginator(props) {
  const {className, previous, next} = props;

  return (
    <nav
      className={clsx(className, 'pagination-nav')}
      aria-label={translate({
        id: 'theme.docs.paginator.navAriaLabel',
        message: 'Docs pages',
        description: 'The ARIA label for the docs pagination',
      })}>
      {previous && (
        <PaginatorNavLink
          {...previous}
          subLabel={translate({
            id: 'theme.docs.paginator.previous',
            message: '上一篇',
            description: 'The label used to navigate to the previous doc',
          })}
        />
      )}
      {next && (
        <PaginatorNavLink
          {...next}
          subLabel={translate({
            id: 'theme.docs.paginator.next',
            message: '下一篇',
            description: 'The label used to navigate to the next doc',
          })}
          isNext
        />
      )}
    </nav>
  );
}
