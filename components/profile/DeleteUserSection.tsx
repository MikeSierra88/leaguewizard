import React, { useState } from 'react';
import { Alert, Collapse, Container, IconButton, Typography } from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0';
import ConfirmationDialog, { ConfirmationDialogResponse } from '@components/core/ConfirmationDialog';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'next/router';
import CloseIcon from '@mui/icons-material/Close';

const DeleteUserSection = () => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [failureAlertOpen, setFailureAlertOpen] = useState(false);

  const deleteUser = async (dialogResponse: ConfirmationDialogResponse) => {
    setFailureAlertOpen(false);
    setConfirmDialogOpen(false);
    if (dialogResponse === ConfirmationDialogResponse.CONFIRM) {
      setLoading(true);
      const res = await fetch(`/api/profile/${user.sub}`, {
        method: 'DELETE',
      });
      setLoading(false);
      const jsonRes = await res.json();
      if (jsonRes.success) {
        router.push('/api/auth/logout');
      } else {
        setFailureAlertOpen(true);
      }
    }
  };

  return (
    <Container
      sx={{
        padding: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'around',
        boxShadow: 2,
        marginTop: '2rem',
      }}
    >
      <Typography variant="h5" component="h2" textAlign="center" color="error" sx={{ mb: 1 }}>
        Delete user
      </Typography>
      <Typography textAlign="center" sx={{ mb: 2 }}>
        You can delete all your stored data, which includes every league you own, every team you created and every match you recorded. This
        cannot be undone, the data will be lost forever.
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
          Error while deleting user - please try again.
        </Alert>
      </Collapse>
      <LoadingButton loading={loading} variant="contained" color="error" onClick={() => setConfirmDialogOpen(true)}>
        Delete user
      </LoadingButton>
      <ConfirmationDialog
        title="Last chance"
        text="Are you sure you want to delete your user? You will lose all your leagues, teams and matches. This cannot be undone."
        open={confirmDialogOpen}
        onClose={deleteUser}
      />
    </Container>
  );
};

export default DeleteUserSection;
