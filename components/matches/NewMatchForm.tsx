import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { Team } from '../../models/TeamModel';
import { League } from '../../models/LeagueModel';
import { useUser } from '@auth0/nextjs-auth0';
import AlertDialog from '@components/core/AlertDialog';

type Props = {
  teams: Team[],
  league: League,
  homeTeam?: string,
  awayTeam?: string,
};

const NewMatchForm = ({ league, teams, homeTeam, awayTeam }: Props) => {
  const { user } = useUser();
  const isLeagueOwner = league.owner === user?.sub;
  const ownTeam = teams ? teams.find((team) => team.owner === user?.sub) : null;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogText, setDialogText] = useState('');

  const [formHomeTeam, setFormHomeTeam] = useState(homeTeam || '');
  const [formHomeScore, setFormHomeScore] = useState(0);
  const [formAwayTeam, setFormAwayTeam] = useState(awayTeam || '');
  const [formAwayScore, setFormAwayScore] = useState(0);

  const handleSubmit = async () => {
    if (formHomeTeam === formAwayTeam) {
      setDialogText('The two teams must be different');
      setDialogOpen(true);
      return;
    }
    const res = await fetch(`/api/leagues/${league._id}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        league: league._id,
        homeTeam: formHomeTeam,
        homeScore: formHomeScore,
        awayTeam: formAwayTeam,
        awayScore: formAwayScore,
      }),
    });
    console.log('Match submitted', res);
  };

  const teamDropdownItems = teams.map((team) => (
    <MenuItem key={team._id} value={team._id}>
      {team.name}
    </MenuItem>
  ));
  const fifaTeamDropdownItems = teams.map((team) => (
    <MenuItem key={team._id} value={team._id}>
      {team.fifaTeam}
    </MenuItem>
  ));

  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ marginTop: '2rem' }}
      >
        <FormControl sx={{ m: 1, minWidth: 140 }}>
          <InputLabel id="new-match-home-team-label">Home team</InputLabel>
          <Select
            labelId="new-match-home-team-label"
            id="new-match-home-team"
            value={formHomeTeam}
            label="Home team"
            autoWidth
            onChange={(e) => setFormHomeTeam(e.target.value)}
          >
            {teamDropdownItems}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 140 }}>
          <InputLabel id="new-match-home-fifa-team-label">
            In-game team
          </InputLabel>
          <Select
            labelId="new-match-home-fifa-team-label"
            id="new-match-home-fifa-team"
            value={formHomeTeam}
            label="In-game team"
            autoWidth
            onChange={(e) => setFormHomeTeam(e.target.value)}
          >
            {fifaTeamDropdownItems}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, width: 100 }}>
          <InputLabel
            id="new-match-home-score-label"
            htmlFor="new-match-home-score"
          >
            Home score
          </InputLabel>
          <Input
            aria-describedby="new-match-home-score-label"
            id="new-match-home-score"
            type="number"
            value={formHomeScore}
            onChange={(e) => setFormHomeScore(Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </FormControl>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ marginTop: '2rem', marginBottom: '2rem' }}
      >
        <FormControl sx={{ m: 1, minWidth: 140 }}>
          <InputLabel id="new-match-away-team-label">Away team</InputLabel>
          <Select
            labelId="new-match-away-team-label"
            id="new-match-away-team"
            value={formAwayTeam}
            label="Away team"
            autoWidth
            onChange={(e) => setFormAwayTeam(e.target.value)}
          >
            {teamDropdownItems}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 140 }}>
          <InputLabel id="new-match-away-fifa-team-label">
            In-game team
          </InputLabel>
          <Select
            labelId="new-match-away-fifa-team-label"
            id="new-match-away-fifa-team"
            value={formAwayTeam}
            label="In-game team"
            autoWidth
            onChange={(e) => setFormAwayTeam(e.target.value)}
          >
            {fifaTeamDropdownItems}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, width: 100 }}>
          <InputLabel
            id="new-match-away-score-label"
            htmlFor="new-match-away-score"
          >
            Away score
          </InputLabel>
          <Input
            aria-describedby="new-match-away-score-label"
            id="new-match-away-score"
            type="number"
            value={formAwayScore}
            onChange={(e) => setFormAwayScore(Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </FormControl>
      </Stack>
      <Button variant="contained" onClick={handleSubmit}>
        Save
      </Button>
      <AlertDialog
        title="Warning"
        text={dialogText}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
};

export default NewMatchForm;
