import React from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Container, Typography } from '@mui/material';
import DeleteUserSection from '@components/profile/DeleteUserSection';

const ProfilePage = withPageAuthRequired(() => {
  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h3" component="h1">
        Profile settings
      </Typography>
      <DeleteUserSection />
    </Container>
  );
});

export default ProfilePage;
