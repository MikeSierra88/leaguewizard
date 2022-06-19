import React, { useState } from 'react';
import MuiNextLink from '@components/navigation/MuiNextLink';
import { Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog, {
  ConfirmationDialogResponse,
} from '@components/core/ConfirmationDialog';
import { useRouter } from 'next/router';

type Props = {
  isOwner: boolean,
  leagueId: string,
};

const ManageLeagueButton = ({ isOwner, leagueId }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const confirmDelete = () => {
    setOpen(true);
  };

  const deleteLeague = (confirmationResponse: string) => {
    if (!isOwner) {
      return;
    }
    setOpen(false);
    if (confirmationResponse === ConfirmationDialogResponse.CONFIRM) {
      fetch(`/api/leagues/${leagueId}`, {
        method: 'DELETE',
      })
        .then(() => {
          console.log('League deleted');
          router.push('/dashboard');
        })
        .catch((err) => console.error(err));
    }
  };

  return isOwner ? (
    <Box>
      <MuiNextLink
        href={`${leagueId}/manage`}
        variant="button"
        underline="hover"
        sx={{ marginInlineEnd: '0.5rem' }}
      >
        <Button variant="contained">Manage league</Button>
      </MuiNextLink>
      <Button variant="contained" color="error" onClick={confirmDelete}>
        <DeleteIcon />
      </Button>
      <ConfirmationDialog
        title="Warning"
        text="You are about to delete this league. This cannot be undone. Do you with to continue?"
        confirmButtonText="Delete"
        open={open}
        onClose={deleteLeague}
      />
    </Box>
  ) : (
    <></>
  );
};

export default ManageLeagueButton;
