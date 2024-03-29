import React from 'react';
import { Box, Typography } from '@mui/material';

type Props = {
  confirmed: boolean,
};

const LeagueViewOnlyInfo = ({ confirmed }: Props) => {
  return !confirmed ? (
    <Box
      sx={{
        marginY: '0.5rem',
        textAlign: 'center',
      }}
    >
      <Typography variant="h6">You can only view this league</Typography>
      <Typography>The league owner has to confirm your application first.</Typography>
    </Box>
  ) : (
    <></>
  );
};
export default LeagueViewOnlyInfo;
