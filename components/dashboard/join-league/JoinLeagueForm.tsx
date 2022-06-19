import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Input,
  Stack,
  FormHelperText,
  Button,
} from '@mui/material';

const DashJoinLeagueForm = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [fifaTeam, setFifaTeam] = useState('');

  const handleSubmit = async () => {
    const newTeamRequest = {
      inviteCode,
      name: playerName,
      fifaTeam,
    };
    console.log('Submitting', newTeamRequest);
    const response = await fetch(`/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTeamRequest),
    });
    const newTeam = await response.json();
    console.log('New team created', newTeam);
  };

  return (
    <Stack direction="column" spacing={3}>
      <FormControl required>
        <InputLabel>Invite code</InputLabel>
        <Input
          id="invite-code"
          area-describedby="invite-code-helper"
          onChange={(e) => setInviteCode(e.target.value)}
          // inputProps={{pattern: /(^[\da-zA-Z]{7}$)/}}
        />
        <FormHelperText id="invite-code-helper">
          Enter the invite code for the league
        </FormHelperText>
      </FormControl>
      <FormControl required>
        <InputLabel>Player name</InputLabel>
        <Input
          id="player-name"
          area-describedby="player-name-helper"
          onChange={(e) => setPlayerName(e.target.value)}
          // inputProps={{pattern: /(^[\da-zA-Z]{7}$)/}}
        />
        <FormHelperText id="player-name-helper">
          Enter your nickname to use in this league
        </FormHelperText>
      </FormControl>
      <FormControl required>
        <InputLabel>In-game team</InputLabel>
        <Input
          id="fifa-team"
          area-describedby="fifa-team-helper"
          onChange={(e) => setFifaTeam(e.target.value)}
          // inputProps={{pattern: /(^[\da-zA-Z]{7}$)/}}
        />
        <FormHelperText id="fifa-team-helper">
          Enter the team you&apos;ll be using in game
        </FormHelperText>
      </FormControl>
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
    </Stack>
  );
};

export default DashJoinLeagueForm;
