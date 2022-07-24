import React from 'react';
import MuiNextLink from '@components/navigation/MuiNextLink';
import { Box, Button } from '@mui/material';

type Props = {
  isOwner: boolean,
  leagueId: string,
};

const ManageLeagueButton = ({ isOwner, leagueId }: Props) => {
  return isOwner ? (
    <Box>
      <MuiNextLink href={`${leagueId}/manage`} variant="button" underline="hover" sx={{ marginInlineEnd: '0.5rem' }}>
        <Button variant="contained">Manage league</Button>
      </MuiNextLink>
    </Box>
  ) : (
    <></>
  );
};

export default ManageLeagueButton;
