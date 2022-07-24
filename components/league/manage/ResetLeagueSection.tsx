import React, { useState } from 'react';
import { Alert, Collapse, IconButton, Stack, Typography } from '@mui/material';
import ConfirmationDialog, { ConfirmationDialogResponse } from '@components/core/ConfirmationDialog';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';

type Props = {
  leagueId: string,
};

const ResetLeagueSection = ({ leagueId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [failureAlertOpen, setFailureAlertOpen] = useState(false);

  const resetLeague = async (confirmationResponse: ConfirmationDialogResponse) => {
    setConfirmDialogOpen(false);
    if (confirmationResponse === ConfirmationDialogResponse.CONFIRM) {
      try {
        setLoading(true);
        const res = await fetch(`/api/leagues/${leagueId}/matches`, {
          method: 'DELETE',
        });
        const jsonRes = await res.json();
        setLoading(false);
        if (jsonRes.success) {
          setSuccessAlertOpen(true);
        } else {
          setFailureAlertOpen(true);
        }
        setTimeout(() => {
          setSuccessAlertOpen(false);
          setFailureAlertOpen(false);
        }, 3000);
      } catch (err) {
        console.error(err);
        setLoading(false);
        setFailureAlertOpen(true);
        setTimeout(() => {
          setFailureAlertOpen(false);
        }, 3000);
      }
    }
  };

  return (
    <>
      <Stack direction="column" alignItems="center" sx={{ marginBottom: '2rem' }}>
        <Typography variant="h6" textAlign="center">
          Reset league
        </Typography>
        <Typography textAlign="center">Deletes all matches from league. This action cannot be undone.</Typography>
        <Collapse in={successAlertOpen}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setSuccessAlertOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 1, mt: 2 }}
          >
            Matches successfully deleted. You have a fresh start!
          </Alert>
        </Collapse>
        <Collapse in={failureAlertOpen}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setFailureAlertOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 1, mt: 2 }}
          >
            Error while deleting matches - please try again.
          </Alert>
        </Collapse>
        <LoadingButton variant="contained" color="error" sx={{ marginTop: '1rem' }} loading={loading} onClick={() => setConfirmDialogOpen(true)}>
          Reset league
        </LoadingButton>
      </Stack>
      <ConfirmationDialog
        title="Last chance"
        text="Are you sure you want to delete all matches form the league? This cannot be undone."
        open={confirmDialogOpen}
        onClose={resetLeague}
      />
    </>
  );
};

export default ResetLeagueSection;
