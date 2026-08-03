import React, {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DocRoot from '@theme-original/DocRoot';
import '../DocPage/styles.css';

export default function DocRootWrapper(props) {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const [collapsed, setCollapsed] = useState(false);
  const expandLabel = currentLocale === 'en' ? 'Expand sidebar' : '展开侧边栏';
  const collapseLabel = currentLocale === 'en' ? 'Collapse sidebar' : '折叠侧边栏';
  const toggleLabel = collapsed ? expandLabel : collapseLabel;

  useEffect(() => {
    document.documentElement.dataset.docsSidebarCollapsed = String(collapsed);

    return () => {
      delete document.documentElement.dataset.docsSidebarCollapsed;
    };
  }, [collapsed]);

  return (
    <>
      <button
        type="button"
        className="docsSidebarToggle"
        aria-label={toggleLabel}
        aria-pressed={collapsed}
        title={toggleLabel}
        onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? '›' : '‹'}
      </button>
      <DocRoot {...props} />
    </>
  );
}
