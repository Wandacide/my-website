import React, {useEffect, useState} from 'react';
import DocPage from '@theme-original/DocPage';
import './styles.css';

export default function DocPageWrapper(props) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.docsSidebarCollapsed = collapsed ? 'true' : 'false';
    return () => {
      delete document.documentElement.dataset.docsSidebarCollapsed;
    };
  }, [collapsed]);

  return (
    <>
      <button
        type="button"
        className="docsSidebarToggle"
        aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? '»' : '«'}
      </button>
      <DocPage {...props} />
    </>
  );
}
