import React from 'react';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import { Button, Typography } from '@mui/material';
import MuiNextLink from '@components/navigation/MuiNextLink';
import { useUser } from '@auth0/nextjs-auth0';
import theme from '../styles/theme';

type Props = {
  imgSrc: string,
  imgAlt: string,
  title: string,
  subtitle: string,
};

const Landing = ({ imgSrc, imgAlt, title, subtitle }: Props) => {
  const { user } = useUser();
  const landingButton = user
    ? {
        label: 'Go To My Dashboard',
        path: '/dashboard',
      }
    : {
        label: 'Login / Sign up',
        path: '/api/auth/login',
      };

  return (
    <Grid
      component="section"
      container
      sx={{
        position: `relative`,
        [`${theme.breakpoints.between('xs', 'sm')} and (orientation: landscape)`]: {
          height: `calc(100vh - 48px)`,
        },
        [theme.breakpoints.up('sm')]: {
          height: `calc(100vh - 64px)`,
        },
        height: `calc(100vh - 56px)`,
        overflow: `hidden`,
      }}
    >
      <Image src={imgSrc} alt={imgAlt} layout="fill" objectFit="cover" />
      <Grid
        container
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0, .7)',
        }}
      />
      <Grid
        container
        item
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          zIndex: 15,
        }}
      >
        <Typography
          variant="h1"
          align="center"
          gutterBottom
          sx={{
            color: 'secondary.main',
            fontWeight: 400,
          }}
        >
          {title}
        </Typography>
        <Typography
          component="p"
          variant="h3"
          align="center"
          color="common.white"
          sx={{
            mb: 10,
          }}
        >
          {subtitle}
        </Typography>
        <MuiNextLink
          href={landingButton.path}
          variant="button"
          underline="hover"
          sx={{
            zIndex: 100,
          }}
        >
          <Button variant="contained" size="large">
            {landingButton.label}
          </Button>
        </MuiNextLink>
      </Grid>
    </Grid>
  );
};

export default Landing;
