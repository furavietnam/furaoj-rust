import React from 'react';

/**
 * Logic: Application footer rendering copyright, version metadata, and system architectural specifications.
 * Input: None.
 * Output: JSX.Element footer component.
 */
export function Footer(): JSX.Element {
  return (
    <footer>
      <span id="footer-content">
        <br />
        dựa trên nền tảng{' '}
        <a style={{ color: '#808080' }} href="//dmoj.ca" target="_blank" rel="noreferrer">
          <b>DMOJ</b>
        </a>{' '}
        | theo dõi Fura trên{' '}
        <a style={{ color: '#808080' }} href="//github.com/furavietnam/furaoj" target="_blank" rel="noreferrer">
          <b>Github</b>
        </a>{' '}
        và{' '}
        <a style={{ color: '#808080' }} href="//www.facebook.com/" target="_blank" rel="noreferrer">
          <b>Facebook</b>
        </a>
      </span>
    </footer>
  );
}
