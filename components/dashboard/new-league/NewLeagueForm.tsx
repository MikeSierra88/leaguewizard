import {
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Button,
  Stack,
} from '@mui/material';
import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

const DashNewLeagueForm = () => {
  const { user } = useUser();
  const [leagueName, setLeagueName] = useState('');

  const handleTextFieldChange = (event) => {
    setLeagueName(event.target.value);
  };

  const handleSubmit = () => {
    fetch('api/leagues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: leagueName,
        createdDate: new Date(),
        owner: user.sub,
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
          onChange={handleTextFieldChange}
        />
        <FormHelperText id="league-name-helper">
          Enter a name for your league.
        </FormHelperText>
      </FormControl>
      <Button variant="contained" onClick={handleSubmit}>
        Save
      </Button>
    </Stack>
  );
};

export default DashNewLeagueForm;
