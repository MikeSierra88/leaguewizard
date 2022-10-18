import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import NewMatchForm from '@components/matches/NewMatchForm';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { fetchLeagueDetails, FetchLeagueDetailsResponse } from '../../../services/leagues.service';
import LoadingScreen from '@components/core/LoadingScreen';

const NewMatchPage = withPageAuthRequired(
  () => {
    const router = useRouter();

    const { leagueId } = router.query;
    const { data, error } = useSWR<FetchLeagueDetailsResponse>(leagueId, fetchLeagueDetails);

    if (!data) {
      return <LoadingScreen loading={true} />;
    }
    if (error) {
      return <div>Error: {error}</div>;
    }

    const { teams, league } = data;

    return (
      <Container>
        <Button variant="contained" sx={{ marginTop: '1rem' }} onClick={() => router.back()}>
          Back
        </Button>
        <Typography variant="h5" sx={{ marginTop: '2rem' }}>
          Add new match
        </Typography>
        <NewMatchForm league={league} teams={teams} />
      </Container>
    );
  },
  { returnTo: '/dashboard' }
);

export default NewMatchPage;
