import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';
import OriginalImg from '@theme-original/MDXComponents/Img';

export default function DocImage(props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const alt = props.alt || '图片';

  return (
    <>
      <button
        type="button"
        className="docs-image-trigger"
        aria-label={`放大${alt}`}
        onClick={() => setOpen(true)}>
        <OriginalImg {...props} className={clsx(props.className, 'docs-image-trigger__img')} />
      </button>

      {open && mounted
        ? createPortal(
            <div
              className="docs-image-modal"
              role="presentation"
              onMouseDown={() => setOpen(false)}>
              <div
                className="docs-image-modal__panel"
                role="dialog"
                aria-modal="true"
                aria-label={`${alt}预览`}
                onMouseDown={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="docs-image-modal__close"
                  aria-label="关闭图片预览"
                  onClick={() => setOpen(false)}>
                  ×
                </button>
                <img className="docs-image-modal__image" src={props.src} alt={props.alt || ''} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
