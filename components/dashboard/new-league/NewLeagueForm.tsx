import {
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

const DashNewLeagueForm = () => {
  const { user } = useUser();
  const [leagueName, setLeagueName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [fifaTeamName, setFifaTeamName] = useState('');

  const handleSubmit = () => {
    fetch('api/leagues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        league: {
          name: leagueName,
          createdDate: new Date(),
          owner: user.sub,
          participants: [user.sub],
        },
        team: {
          name: teamName,
          fifaTeam: fifaTeamName,
          owner: user.sub,
          createdDate: new Date(),
        },
      }),
    })
      .then((res) => {
        console.log('Submitted', res);
      })
      .catch((err) => console.error(err));
  };

  return (
    <Stack direction="column" spacing={3}>
      <FormControl>
        <InputLabel htmlFor="league-name">League name</InputLabel>
        <Input
          id="league-name"
          aria-describedby="league-name-helper"
          onChange={(e) => setLeagueName(e.target.value)}
        />
        <FormHelperText id="league-name-helper">
          Enter a name for your league.
        </FormHelperText>
      </FormControl>
      <Typography>Your team details</Typography>
      <FormControl>
        <InputLabel htmlFor="league-name">Your nickname</InputLabel>
        <Input
          id="team-nickname"
          aria-describedby="team-nickname-helper"
          onChange={(e) => setTeamName(e.target.value)}
        />
        <FormHelperText id="team-nickname-helper">
          Enter your nickname to use for this league.
        </FormHelperText>
      </FormControl>
      <FormControl>
        <InputLabel htmlFor="league-name">In-game team</InputLabel>
        <Input
          id="fifa-team"
          aria-describedby="fifa-team-helper"
          onChange={(e) => setFifaTeamName(e.target.value)}
        />
        <FormHelperText id="fifa-team-helper">
          Enter your in-game team for this league.
        </FormHelperText>
      </FormControl>
      <Button variant="contained" onClick={handleSubmit}>
        Save
      </Button>
    </Stack>
  );
};

export default DashNewLeagueForm;
