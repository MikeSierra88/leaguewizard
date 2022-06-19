import React, { useEffect, useState } from 'react';
import { Team } from '../../../models/TeamModel';
import {
  Button,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

type Props = {
  pendingTeams: Array<Team>,
};

const PendingTeams = ({ pendingTeams }: Props) => {
  console.log(pendingTeams);
  const [pendingTeamList, setPendingTeamList] = useState(pendingTeams);

  const confirmOrRejectTeam = async (teamId: string, isConfirming: boolean) => {
    const res = await fetch(
      `/api/teams/${teamId}/${isConfirming ? 'confirm' : 'reject'}`,
      {
        method: 'POST',
      }
    );
    const data = await res.json();
    console.log(data);
    if (data.success) {
      setPendingTeamList(pendingTeams.filter((team) => team._id !== teamId));
    } else {
      console.log("Couldn't confirm team");
    }
  };

  const updateTeamsList = () => {
    return pendingTeamList.map((team) => (
      <PendingTeam
        team={team}
        key={team._id}
        confirmOrRejectTeam={confirmOrRejectTeam.bind(this)}
      />
    ));
  };

  let teamsList = updateTeamsList();

  useEffect(() => {
    teamsList = updateTeamsList();
  }, [pendingTeamList]);

  return teamsList.length > 0 ? (
    <Container
      sx={{
        padding: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'around',
        boxShadow: 2,
        marginBottom: '1.25rem',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          marginBottom: '1.2rem',
        }}
      >
        Pending teams
      </Typography>
      <Grid container spacing={1} sx={{ alignItems: 'center' }}>
        <Grid item xs={4}>
          <Typography variant="h6">Player name</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6">In-game team</Typography>
        </Grid>
        <Grid item xs={4}></Grid>
      </Grid>
      {teamsList}
    </Container>
  ) : (
    <></>
  );
};

const PendingTeam = ({
  team,
  confirmOrRejectTeam,
}: {
  team: Team,
  confirmOrRejectTeam: Function,
}) => {
  const confirmTeam = () => {
    return confirmOrRejectTeam(team._id, true);
  };

  const rejectTeam = () => {
    return confirmOrRejectTeam(team._id, false);
  };

  return (
    <Grid container spacing={1} sx={{ alignItems: 'center' }}>
      <Grid item xs={4}>
        <Typography>{team.name}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography>{team.fifaTeam}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={confirmTeam}
          >
            <CheckIcon />
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={rejectTeam}
          >
            <ClearIcon />
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default PendingTeams;
