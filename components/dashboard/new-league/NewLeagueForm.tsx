import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Input, FormHelperText, Stack, Typography, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useUser } from '@auth0/nextjs-auth0';
import { object, string, TypeOf } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';

const DashNewLeagueForm = () => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newLeagueId, setNewLeagueId] = useState('');

  const newLeagueSchema = object({
    leagueName: string().trim().min(1, { message: 'You must provide a league name' }),
    playerName: string().trim().min(1, {
      message: 'You must provide a nickname',
    }),
    fifaTeam: string().trim().min(1, {
      message: 'You must provide your in-game team',
    }),
  });

  type NewLeagueInput = TypeOf<typeof newLeagueSchema>;

  const {
    register,
    formState: { errors, isSubmitSuccessful },
    reset,
    handleSubmit,
  } = useForm<NewLeagueInput>({ resolver: zodResolver(newLeagueSchema) });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
      if (newLeagueId) {
        router.push(`/leagues/${newLeagueId}`);
      }
    }
  }, [isSubmitSuccessful, reset]);

  const onSubmitHandler: SubmitHandler<NewLeagueInput> = async (values) => {
    try {
      setLoading(true);
      const res = await fetch('api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          league: {
            name: values.leagueName,
            createdDate: new Date(),
            owner: user.sub,
            participants: [user.sub],
          },
          team: {
            name: values.playerName,
            fifaTeam: values.fifaTeam,
            owner: user.sub,
            createdDate: new Date(),
          },
        }),
      });
      const jsonResponse = await res.json();
      console.log('Created league', jsonResponse);
      setLoading(false);
      if (jsonResponse.success) {
        setNewLeagueId(jsonResponse.data.league._id);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmitHandler)} sx={{ marginTop: '1rem' }}>
      <Stack direction="column" spacing={3}>
        <FormControl error={!!errors.leagueName} required>
          <InputLabel htmlFor="league-name">League name</InputLabel>
          <Input id="league-name" aria-describedby="league-name-helper" required error={!!errors.leagueName} {...register('leagueName')} />
          <FormHelperText id="league-name-helper" error={!!errors.leagueName}>
            {errors.leagueName ? errors.leagueName.message : 'Enter a name for your league.'}
          </FormHelperText>
        </FormControl>
        <Typography>Your team details</Typography>
        <FormControl error={!!errors.playerName} required>
          <InputLabel htmlFor="league-name">Your nickname</InputLabel>
          <Input
            id="team-nickname"
            aria-describedby="team-nickname-helper"
            required
            error={!!errors.playerName}
            {...register('playerName')}
          />
          <FormHelperText id="team-nickname-helper" error={!!errors.playerName}>
            {errors.playerName ? errors.playerName.message : 'Enter your nickname to use for this league.'}
          </FormHelperText>
        </FormControl>
        <FormControl error={!!errors.fifaTeam} required>
          <InputLabel htmlFor="league-name">In-game team</InputLabel>
          <Input id="fifa-team" aria-describedby="fifa-team-helper" required error={!!errors.fifaTeam} {...register('fifaTeam')} />
          <FormHelperText id="fifa-team-helper" error={!!errors.fifaTeam}>
            {errors.fifaTeam ? errors.fifaTeam.message : 'Enter your in-game team for this league.'}
          </FormHelperText>
        </FormControl>
        <LoadingButton variant="contained" type="submit" loading={loading}>
          Create league
        </LoadingButton>
      </Stack>
    </Box>
  );
};

export default DashNewLeagueForm;
