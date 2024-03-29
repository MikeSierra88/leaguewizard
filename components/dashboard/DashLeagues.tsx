import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import LeagueListItem from '@components/dashboard/leagues/LeagueListItem';
import { League } from '../../models/LeagueModel';

const DashLeagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  const fetchLeagues = () => {
    setLoading(true);
    fetch('api/leagues')
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        setLeagues(json.data);
      })
      .catch((err) => {
        console.error('Error while fetching leagues', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // load leagues from API
  useEffect(() => {
    fetchLeagues();
  }, []);

  const leagueArray = leagues.map((league) => {
    return <LeagueListItem key={league.id} league={league} />;
  });

  return isLoading ? (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <Container>
      <Typography variant="h5">Leagues</Typography>
      <Grid container spacing={4}>
        {leagueArray}
      </Grid>
    </Container>
  );
};

export default DashLeagues;
