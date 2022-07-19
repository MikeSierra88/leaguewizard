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
  teamId: string,
  leagueId: string,
};

const ManageTeamButton = ({ isOwner, teamId, leagueId }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const confirmDelete = () => {
    setOpen(true);
  };

  const deleteTeam = (confirmationResponse: string) => {
    if (!isOwner) {
      return;
    }
    setOpen(false);
    if (confirmationResponse === ConfirmationDialogResponse.CONFIRM) {
      fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      })
        .then(() => {
          console.log('Team deleted');
          router.push('/dashboard');
        })
        .catch((err) => console.error(err));
    }
  };

  return isOwner ? (
    <Box>
      <MuiNextLink
        href={`/leagues/${leagueId}/new-match`}
        variant="button"
        underline="hover"
        sx={{ marginInlineEnd: '0.5rem' }}
      >
        <Button variant="contained">Add new match</Button>
      </MuiNextLink>
      <Button variant="contained" color="error" onClick={confirmDelete}>
        <DeleteIcon />
      </Button>
      <ConfirmationDialog
        title="Warning"
        text="You are about to delete this team and remove yourself from the league. This cannot be undone. Do you wish to continue?"
        confirmButtonText="Delete"
        open={open}
        onClose={deleteTeam}
      />
    </Box>
  ) : (
    <></>
  );
};

export default ManageTeamButton;
