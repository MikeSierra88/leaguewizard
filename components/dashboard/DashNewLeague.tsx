import React from 'react';
import DashNewLeagueForm from '@components/dashboard/new-league/NewLeagueForm';
import { Container, Typography } from '@mui/material';

const DashNewLeague = () => {
  return (
    <Container>
      <Typography variant="h5">New League</Typography>
      <DashNewLeagueForm />
    </Container>
  );
};

export default DashNewLeague;
