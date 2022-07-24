import React, { useEffect, useState } from 'react';
import { Alert, Box, Collapse, FormControl, FormHelperText, IconButton, Input, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import { Team } from '../../models/TeamModel';
import { League } from '../../models/LeagueModel';
import { useUser } from '@auth0/nextjs-auth0';
import { object, string, TypeOf, ZodIssueCode } from 'zod';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type Props = {
  teams: Team[],
  league: League,
  homeTeam?: string,
  awayTeam?: string,
};

const NewMatchForm = ({ league, teams }: Props) => {
  const { user } = useUser();
  const isLeagueOwner = league.owner === user?.sub;
  const ownTeam = teams ? teams.find((team) => team.owner === user?.sub) : null;

  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [failureAlertOpen, setFailureAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const newMatchSchema = object({
    formHomeTeam: string()
      .min(1, { message: 'You must select a home team' })
      // Mongo ID regex
      .regex(/^[a-f\d]{24}$/i, { message: 'Invalid team' }),
    formHomeScore: string()
      .refine((val) => !Number.isNaN(parseInt(val)), {
        message: 'Score must be a number',
      })
      .refine((val) => parseInt(val) >= 0, {
        message: 'Score cannot be negative',
      }),
    formAwayTeam: string()
      .min(1, { message: 'You must select an away team' })
      // Mongo ID regex
      .regex(/^[a-f\d]{24}$/i, { message: 'Invalid team' }),
    formAwayScore: string()
      .refine((val) => !Number.isNaN(parseInt(val)), {
        message: 'Score must be a number',
      })
      .refine((val) => parseInt(val) >= 0, {
        message: 'Score cannot be negative',
      }),
  }).superRefine((data, ctx) => {
    if (data.formHomeTeam === data.formAwayTeam) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'The two teams must be different',
        path: ['formHomeTeam'],
      });
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'The two teams must be different',
        path: ['formAwayTeam'],
      });
    }
    if (!isLeagueOwner && ownTeam._id !== data.formAwayTeam && ownTeam._id !== data.formHomeTeam) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'One of the teams must be your own',
        path: ['formHomeTeam'],
      });
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'One of the teams must be your own',
        path: ['formAwayTeam'],
      });
    }
  });

  type NewMatchInput = TypeOf<typeof newMatchSchema>;

  const {
    register,
    formState: { errors, isSubmitSuccessful },
    control,
    reset,
    handleSubmit,
  } = useForm<NewMatchInput>({ resolver: zodResolver(newMatchSchema) });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const onSubmitHandler: SubmitHandler<NewMatchInput> = async (values) => {
    try {
      setLoading(true);
      await fetch(`/api/leagues/${league._id}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          league: league._id,
          homeTeam: values.formHomeTeam,
          homeScore: values.formHomeScore,
          awayTeam: values.formAwayTeam,
          awayScore: values.formAwayScore,
        }),
      });
      setLoading(false);
      setSuccessAlertOpen(true);
      setTimeout(() => {
        setSuccessAlertOpen(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setFailureAlertOpen(true);
      setTimeout(() => {
        setFailureAlertOpen(false);
      }, 3000);
    }
  };

  const teamDropdownItems = teams.map((team) => (
    <MenuItem key={team._id} value={team._id}>
      {team.name}
    </MenuItem>
  ));
  const fifaTeamDropdownItems = teams.map((team) => (
    <MenuItem key={team._id} value={team._id}>
      {team.fifaTeam}
    </MenuItem>
  ));

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmitHandler)} sx={{ marginTop: '2rem' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl sx={{ m: 1, minWidth: 140 }} required error={!!errors.formHomeTeam}>
          <InputLabel id="new-match-home-team-label">Home team</InputLabel>
          <Controller
            control={control}
            name="formHomeTeam"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select
                labelId="new-match-home-team-label"
                id="new-match-home-team"
                label="Home team"
                autoWidth
                value={value}
                onChange={onChange}
              >
                {teamDropdownItems}
              </Select>
            )}
            defaultValue=""
          />
          <FormHelperText>{errors.formHomeTeam ? errors.formHomeTeam.message : ''}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 160 }} required error={!!errors.formHomeTeam}>
          <InputLabel id="new-match-home-fifa-team-label">In-game team</InputLabel>
          <Controller
            control={control}
            name="formHomeTeam"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select
                labelId="new-match-home-fifa-team-label"
                id="new-match-home-fifa-team"
                label="In-game team"
                autoWidth
                value={value}
                onChange={onChange}
              >
                {fifaTeamDropdownItems}
              </Select>
            )}
            defaultValue=""
          />
          <FormHelperText error={!!errors.formHomeTeam}>{errors.formHomeTeam ? errors.formHomeTeam.message : ''}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 1 }} required error={!!errors.formHomeScore}>
          <InputLabel id="new-match-home-score-label" htmlFor="new-match-home-score">
            Home score
          </InputLabel>
          <Input
            aria-describedby="new-match-home-score-label"
            id="new-match-home-score"
            type="number"
            required
            error={!!errors.formHomeScore}
            {...register('formHomeScore')}
            inputProps={{ min: 0 }}
          />
          <FormHelperText error={!!errors.formHomeScore}>{errors.formHomeScore ? errors.formHomeScore.message : ''}</FormHelperText>
        </FormControl>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <FormControl sx={{ m: 1, minWidth: 140 }} required error={!!errors.formAwayTeam}>
          <InputLabel id="new-match-away-team-label">Away team</InputLabel>
          <Controller
            control={control}
            name="formAwayTeam"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select
                labelId="new-match-away-team-label"
                id="new-match-away-team"
                label="Away team"
                autoWidth
                value={value}
                onChange={onChange}
              >
                {teamDropdownItems}
              </Select>
            )}
            defaultValue=""
          />
          <FormHelperText error={!!errors.formAwayTeam}>{errors.formAwayTeam ? errors.formAwayTeam.message : ''}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 160 }} required error={!!errors.formAwayTeam}>
          <InputLabel id="new-match-away-fifa-team-label">In-game team</InputLabel>
          <Controller
            control={control}
            name="formAwayTeam"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select
                labelId="new-match-away-fifa-team-label"
                id="new-match-away-fifa-team"
                label="In-game team"
                autoWidth
                value={value}
                onChange={onChange}
              >
                {fifaTeamDropdownItems}
              </Select>
            )}
            defaultValue=""
          />
          <FormHelperText error={!!errors.formAwayTeam}>{errors.formAwayTeam ? errors.formAwayTeam.message : ''}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 1 }} required error={!!errors.formAwayScore}>
          <InputLabel id="new-match-away-score-label" htmlFor="new-match-away-score">
            Away score
          </InputLabel>
          <Input
            aria-describedby="new-match-away-score-label"
            id="new-match-away-score"
            type="number"
            required
            error={!!errors.formAwayScore}
            {...register('formAwayScore')}
            inputProps={{ min: 0 }}
          />
          <FormHelperText error={!!errors.formAwayScore}>{errors.formAwayScore ? errors.formAwayScore.message : ''}</FormHelperText>
        </FormControl>
      </Stack>
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
          sx={{ mb: 2 }}
        >
          Match successfully added!
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
          sx={{ mb: 2 }}
        >
          Error while adding match - please try again.
        </Alert>
      </Collapse>
      <LoadingButton variant="contained" type="submit" loading={loading}>
        Submit match
      </LoadingButton>
    </Box>
  );
};

export default NewMatchForm;
