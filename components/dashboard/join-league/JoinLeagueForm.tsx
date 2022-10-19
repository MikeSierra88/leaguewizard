import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Input, Stack, FormHelperText, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { object, string, TypeOf } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';

const DashJoinLeagueForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newLeagueId, setNewLeagueId] = useState('');

  const joinLeagueSchema = object({
    inviteCode: string()
      .trim()
      .regex(/(^[\da-zA-Z]{7}$)/, {
        message: 'Invalid invite code format',
      }),
    playerName: string().trim().min(1, {
      message: 'You must provide a nickname',
    }),
    fifaTeam: string().trim().min(1, {
      message: 'You must provide your in-game team',
    }),
  });

  type JoinLeagueInput = TypeOf<typeof joinLeagueSchema>;

  const {
    register,
    formState: { errors, isSubmitSuccessful },
    reset,
    handleSubmit,
  } = useForm<JoinLeagueInput>({ resolver: zodResolver(joinLeagueSchema) });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
      if (newLeagueId) {
        router.push(`/leagues/${newLeagueId}`);
      }
    }
  }, [isSubmitSuccessful, reset]);

  const onSubmitHandler: SubmitHandler<JoinLeagueInput> = async (values) => {
    try {
      setLoading(true);
      const newTeamRequest = {
        inviteCode: values.inviteCode,
        name: values.playerName,
        fifaTeam: values.fifaTeam,
      };
      const response = await fetch(`/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeamRequest),
      });
      const jsonResponse = await response.json();
      setLoading(false);
      if (jsonResponse.success) {
        setNewLeagueId(jsonResponse.data.league);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmitHandler)} sx={{ marginTop: '1rem' }}>
      <Stack direction="column" spacing={3}>
        <FormControl required error={!!errors.inviteCode}>
          <InputLabel>Invite code</InputLabel>
          <Input id="invite-code" area-describedby="invite-code-helper" required error={!!errors.inviteCode} {...register('inviteCode')} />
          <FormHelperText id="invite-code-helper" error={!!errors.inviteCode}>
            {errors.inviteCode ? errors.inviteCode.message : 'Enter the invite code for the league'}
          </FormHelperText>
        </FormControl>
        <FormControl required error={!!errors.playerName}>
          <InputLabel>Player name</InputLabel>
          <Input id="player-name" area-describedby="player-name-helper" required error={!!errors.playerName} {...register('playerName')} />
          <FormHelperText id="player-name-helper" error={!!errors.playerName}>
            {errors.playerName ? errors.playerName.message : 'Enter your nickname to use in this league'}
          </FormHelperText>
        </FormControl>
        <FormControl required error={!!errors.fifaTeam}>
          <InputLabel>In-game team</InputLabel>
          <Input id="fifa-team" area-describedby="fifa-team-helper" required error={!!errors.fifaTeam} {...register('fifaTeam')} />
          <FormHelperText id="fifa-team-helper" error={!!errors.fifaTeam}>
            {errors.fifaTeam ? errors.fifaTeam.message : 'Enter the team you&apos;ll be using in game'}
          </FormHelperText>
        </FormControl>
        <LoadingButton variant="contained" type="submit" loading={loading}>
          Join league
        </LoadingButton>
      </Stack>
    </Box>
  );
};

export default DashJoinLeagueForm;
