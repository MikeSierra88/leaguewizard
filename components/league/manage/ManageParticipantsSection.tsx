import React, { useState } from 'react';
import { Team } from '../../../models/TeamModel';
import { Container, Typography } from '@mui/material';
import ManageParticipantsTableRow from '@components/league/manage/ManageParticipantsTableRow';

type Props = {
  teams: Team[],
  leagueOwner: string,
};

const ManageParticipantsSection = ({ teams, leagueOwner }: Props) => {
  const [teamList, setTeamList] = useState(teams.filter((team) => team.owner !== leagueOwner));

  const removeTeam = (id: string) => setTeamList(teamList.filter((team) => team._id !== id));

  const teamRows =
    teamList.length > 0 ? (
      teamList.map((team) => <ManageParticipantsTableRow key={team._id} team={team} removeTeamFromList={removeTeam.bind(this)} />)
    ) : (
      <Typography>No other teams in league. Try inviting some of your friends!</Typography>
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
      <Typography variant="h5">Manage participants</Typography>
      <Typography sx={{ mb: 2 }}>Excluding the league owner&lsquo;s team</Typography>
      {teamRows}
    </Container>
  );
};

export default ManageParticipantsSection;
