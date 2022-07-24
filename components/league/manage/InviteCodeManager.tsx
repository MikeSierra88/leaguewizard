import React, { useState } from 'react';
import { League } from '../../../models/LeagueModel';
import { Button, Container, Typography } from '@mui/material';

type Props = {
  league: League,
};

const InviteCodeManager = ({ league }: Props) => {
  const [inviteCode, setInviteCode] = useState(league.inviteCode?.code);

  const getInviteCode = async () => {
    const response = await fetch(`/api/leagues/${league._id}/invite-code`);
    const inviteCode = await response.json();
    if (inviteCode.data) {
      setInviteCode(inviteCode.data);
    }
  };

  const removeInviteCode = async () => {
    await fetch(`/api/leagues/${league._id}/invite-code`, {
      method: 'DELETE',
    });
    setInviteCode(null);
  };

  const button = inviteCode ? (
    <Button variant="contained" color="error" sx={{ marginTop: '1rem' }} onClick={() => removeInviteCode()}>
      Remove invite code
    </Button>
  ) : (
    <Button variant="contained" sx={{ marginTop: '1rem' }} onClick={() => getInviteCode()}>
      Get invite code
    </Button>
  );

  return (
    <Container
      sx={{
        padding: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'around',
        boxShadow: 2,
        marginTop: '2rem',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          marginBottom: '1.2rem',
        }}
      >
        Invite code
      </Typography>
      <Typography variant="h6">{inviteCode ? inviteCode : 'Invitation is closed'}</Typography>
      {button}
    </Container>
  );
};

export default InviteCodeManager;
