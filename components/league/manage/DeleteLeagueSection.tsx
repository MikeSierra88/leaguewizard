import React, { useState } from 'react';
import { Alert, Collapse, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import ConfirmationDialog, { ConfirmationDialogResponse } from '@components/core/ConfirmationDialog';
import { useRouter } from 'next/router';

type Props = {
  leagueId: string,
};

const DeleteLeagueSection = ({ leagueId }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [failureAlertOpen, setFailureAlertOpen] = useState(false);

  const deleteLeague = async (confirmationResponse: ConfirmationDialogResponse) => {
    setConfirmDialogOpen(false);
    if (confirmationResponse === ConfirmationDialogResponse.CONFIRM) {
      setLoading(true);
      try {
        const res = await fetch(`/api/leagues/${leagueId}`, {
          method: 'DELETE',
        });
        setLoading(false);
        const jsonRes = await res.json();
        if (jsonRes.success) {
          router.push('/dashboard');
        } else {
          setFailureAlertOpen(true);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
        setFailureAlertOpen(true);
      }
    }
  };

  return (
    <>
      <Stack direction="column" alignItems="center" sx={{ marginBottom: '1rem' }}>
        <Typography variant="h6" textAlign="center">
          Delete league
        </Typography>
        <Typography textAlign="center">
          Deletes league, including all teams and all recorded matches. This action cannot be undone.
        </Typography>
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
            Error while deleting league - please try again.
          </Alert>
        </Collapse>
        <LoadingButton
          variant="contained"
          color="error"
          sx={{ marginTop: '1rem' }}
          loading={loading}
          onClick={() => setConfirmDialogOpen(true)}
        >
          Delete League
        </LoadingButton>
      </Stack>
      <ConfirmationDialog
        title="Last chance"
        text="Are you sure you want to delete the league? This cannot be undone."
        open={confirmDialogOpen}
        onClose={deleteLeague}
      />
    </>
  );
};

export default DeleteLeagueSection;
