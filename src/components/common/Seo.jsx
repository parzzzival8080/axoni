import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://gldcoin.co';
const DEFAULT_IMAGE = 'https://gldcoin.co/logo512.png';

export default function Seo({
  title,
  description,
  path = '',
  image = DEFAULT_IMAGE,
  noindex = false,
}) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title ? `${title} | GLD` : 'GLD - Buy Bitcoin & Trade Crypto | Low Fees, Spot & Futures Exchange';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
