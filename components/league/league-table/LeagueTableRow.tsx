import React from 'react';
import { Box, Typography } from '@mui/material';
import { Team } from '../../../models/TeamModel';
import MuiNextLink from '@components/navigation/MuiNextLink';

type Props = {
  team: Team,
};

const LeagueTableRow = ({ team }: Props) => {
  return (
    <Box>
      <MuiNextLink href={`/teams/${team._id}`}>
        <Typography>{team.name}</Typography>
      </MuiNextLink>
    </Box>
  );
};

export default LeagueTableRow;
