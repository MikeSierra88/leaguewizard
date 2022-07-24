import React, { useState } from 'react';
import { Team } from '../../../models/TeamModel';
import { Grid, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog, { ConfirmationDialogResponse } from '@components/core/ConfirmationDialog';

type Props = {
  team: Team,
  removeTeamFromList: (id) => {},
};

const ManageParticipantsTableRow = ({ team, removeTeamFromList }: Props) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteTeam = async (dialogResponse: ConfirmationDialogResponse) => {
    setConfirmDialogOpen(false);
    if (dialogResponse === ConfirmationDialogResponse.CONFIRM) {
      setLoading(true);
      const response = await fetch(`/api/teams/${team._id}`, {
        method: 'DELETE',
      });
      setLoading(false);
      const jsonRes = await response.json();
      if (jsonRes.success) {
        removeTeamFromList(team._id);
      }
    }
  };

  return (
    <Grid key={team._id} container spacing={1} sx={{ mb: 1 }}>
      <Grid item xs={5}>
        <Typography>{team.name}</Typography>
      </Grid>
      <Grid item xs={5}>
        <Typography>{team.fifaTeam}</Typography>
      </Grid>
      <Grid item xs>
        <LoadingButton startIcon={<DeleteIcon />} variant="contained" color="error" loading={loading} onClick={() => setConfirmDialogOpen(true)}>
          Delete team
        </LoadingButton>
      </Grid>
      <ConfirmationDialog
        title="Delete team"
        text="Are you sure you want to delete this team and all their recorded matches? This action cannot be undone."
        open={confirmDialogOpen}
        onClose={deleteTeam}
      />
    </Grid>
  );
};

export default ManageParticipantsTableRow;
