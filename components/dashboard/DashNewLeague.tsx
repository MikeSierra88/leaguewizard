import React from 'react';
import DashNewLeagueForm from '@components/dashboard/new-league/NewLeagueForm';
import { Container } from '@mui/material';

const DashNewLeague = () => {
  return (
    <Container>
      <h1>New League</h1>
      <DashNewLeagueForm />
    </Container>
  );
};

export default DashNewLeague;
