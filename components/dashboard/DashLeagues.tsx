import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid } from '@mui/material';
import LeagueListItem from '@components/dashboard/leagues/LeagueListItem';
import { League } from '../../models/League';

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
    return (
      <LeagueListItem
        key={league._id}
        league={league}
      />
    );
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
      <h1>Leagues</h1>
      <Grid container spacing={4}>
        {leagueArray}
      </Grid>
    </Container>
  );
};

export default DashLeagues;
