import React, { Component } from 'react';
import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../lib/createEmotionCache';
import { ThemeProvider } from '@mui/material/styles';
import { UserProvider } from '@auth0/nextjs-auth0';
import CssBaseline from '@mui/material/CssBaseline';

import '/styles/global.css';
import theme from '../styles/theme';

import Header from '@components/Header';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function LeagueWizardApp(props: any) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <UserProvider>
        <Head>
          <title>LeagueWizard</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Header />
          <Component {...pageProps} />
        </ThemeProvider>
      </UserProvider>
    </CacheProvider>
  );
}
