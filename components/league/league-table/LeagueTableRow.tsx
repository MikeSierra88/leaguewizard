import React from 'react';
import { Box, Typography } from '@mui/material';
import { Team } from '../../../models/TeamModel';

type Props = {
  team: Team,
};

const LeagueTableRow = ({ team }: Props) => {
  return (
    <Box>
      <Typography>{team.name}</Typography>
    </Box>
  );
};

export default LeagueTableRow;
