import React from 'react';
import { Container, Typography } from '@mui/material';
import DashJoinLeagueForm from '@components/dashboard/join-league/JoinLeagueForm';

const DashJoinLeague = () => {
  return (
    <Container>
      <Typography variant="h5" sx={{ marginBottom: '1.25rem' }}>
        Join League
      </Typography>
      <DashJoinLeagueForm />
    </Container>
  );
};

export default DashJoinLeague;
