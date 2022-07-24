import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import LoadingScreen from '@components/core/LoadingScreen';
import InviteCodeManager from '@components/league/manage/InviteCodeManager';
import { League } from '../../../models/LeagueModel';
import { Team } from '../../../models/TeamModel';
import PendingTeams from '@components/league/manage/PendingTeams';
import ResetLeagueSection from '@components/league/manage/ResetLeagueSection';
import DeleteLeagueSection from '@components/league/manage/DeleteLeagueSection';

type Props = {
  league: League,
  teams: Array<Team>,
};

const ManageLeaguePage = ({ league, teams }: Props) => {
  const router = useRouter();

  const pendingTeams = teams.filter((team) => {
    return team.confirmed === false;
  });

  return league ? (
    <Container>
      <Button variant="contained" sx={{ marginTop: '1rem' }} onClick={() => router.back()}>
        Back
      </Button>
      <h1>Managing {league.name}</h1>
      {/* Change name */}
      {/* Manage participants */}
      {/* Pending teams */}
      <PendingTeams pendingTeams={pendingTeams} />
      {/* Invite code */}
      <InviteCodeManager league={league} />
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
        <Typography
          variant="h5"
          color="error"
          sx={{
            textTransform: 'uppercase',
            marginBottom: '1.2rem',
          }}
        >
          Danger zone
        </Typography>
        {/* Reset */}
        <ResetLeagueSection leagueId={league._id} />
        {/* Delete */}
        <DeleteLeagueSection leagueId={league._id} />
      </Container>
    </Container>
  ) : (
    <LoadingScreen loading={false} />
  );
};

export default ManageLeaguePage;

export const getServerSideProps = withPageAuthRequired({
  returnTo: '/dashboard',
  async getServerSideProps(ctx) {
    const auth0User = getSession(ctx.req, ctx.res);
    const { leagueId } = ctx.params;

    let res = await fetch(`${process.env.API_BASE_URL}/api/leagues/${leagueId}`, {
      headers: {
        Cookie: ctx.req.headers.cookie,
      },
    });
    let data = await res.json();
    const league: League = data.data;

    if (auth0User.user?.sub !== league.owner) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    res = await fetch(`${process.env.API_BASE_URL}api/leagues/${leagueId}/teams`, {
      headers: {
        Cookie: ctx.req.headers.cookie,
      },
    });
    data = await res.json();
    const teams: Team[] = data.data;

    return { props: { league, teams } };
  },
});
