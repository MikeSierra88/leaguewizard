import Head from "next/head";
import {CacheProvider} from '@emotion/react';
import createEmotionCache from '../styles/createEmotionCache'
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "/styles/global.css";
import theme from '../styles/theme';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function LeagueWizardApp(props) {
    const {Component, emotionCache = clientSideEmotionCache, pageProps} = props;

    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <title>LeagueWizard</title>
                <meta name="viewport" content="initial-scale=1, width=device-width"/>
            </Head>
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <Component {...pageProps} />
            </ThemeProvider>
        </CacheProvider>
    );
}
