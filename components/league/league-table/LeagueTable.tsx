import React from 'react';
import { Container, Typography } from '@mui/material';
import { Team } from '../../../models/TeamModel';
import LeagueTableRow from '@components/league/league-table/LeagueTableRow';

type Props = {
  teams: Array<Team>,
};

const LeagueTable = ({ teams }: Props) => {
  const rows = teams.map((team) => (
    <LeagueTableRow team={team} key={team._id} />
  ));

  return (
    <Container>
      <Typography>League table</Typography>
      {rows}
    </Container>
  );
};
export default LeagueTable;
