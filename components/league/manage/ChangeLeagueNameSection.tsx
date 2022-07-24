import React, { useState } from 'react';
import { Alert, Box, Collapse, Container, FormControl, FormHelperText, IconButton, Input, InputLabel, Stack, Typography } from '@mui/material';
import { object, string, TypeOf } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { League } from '../../../models/LeagueModel';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  league: League,
  saveLeagueName: (name: string) => void,
};

const ChangeLeagueNameSection = ({ league, saveLeagueName }: Props) => {
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [failureAlertOpen, setFailureAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const changeNameSchema = object({
    name: string().min(1, { message: 'You must provide a league name' }).default(league.name),
  });

  type ChangeNameInput = TypeOf<typeof changeNameSchema>;
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ChangeNameInput>({ resolver: zodResolver(changeNameSchema) });

  const onSubmitHandler: SubmitHandler<ChangeNameInput> = async (values) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leagues/${league._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...league,
          name: values.name,
        }),
      });
      const jsonRes = await res.json();
      setLoading(false);
      if (jsonRes.success) {
        saveLeagueName(values.name);
        setSuccessAlertOpen(true);
      } else {
        setFailureAlertOpen(true);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setFailureAlertOpen(true);
    } finally {
      setTimeout(() => {
        setSuccessAlertOpen(false);
        setFailureAlertOpen(false);
      }, 3000);
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
      <Typography variant="h5" sx={{ marginBottom: '1.2rem' }}>
        Change league name
      </Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmitHandler)} sx={{ mt: 1 }}>
        <Stack spacing={2} justifyContent="center">
          <FormControl required error={!!errors.name}>
            <InputLabel id="name-label">League name</InputLabel>
            <Input id="name" aria-describedby="name-label" required error={!!errors.name} {...register('name')} />
            <FormHelperText id="name-helper" error={!!errors.name}>
              {errors.name ? errors.name.message : 'Enter a new name for your league'}
            </FormHelperText>
          </FormControl>
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
              sx={{ mb: 1 }}
            >
              League name change successful
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
              sx={{ mb: 1 }}
            >
              Error while saving new name - please try again.
            </Alert>
          </Collapse>
          <LoadingButton variant="contained" type="submit" loading={loading}>
            Save new name
          </LoadingButton>
        </Stack>
      </Box>
    </Container>
  );
};

export default ChangeLeagueNameSection;
