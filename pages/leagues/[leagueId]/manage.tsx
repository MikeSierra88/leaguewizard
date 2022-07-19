import React from 'react';
import { Button, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import LoadingScreen from '@components/core/LoadingScreen';
import InviteCodeManager from '@components/league/manage/InviteCodeManager';
import { League } from '../../../models/LeagueModel';
import { Team } from '../../../models/TeamModel';
import PendingTeams from '@components/league/manage/PendingTeams';

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
      <Button
        variant="contained"
        sx={{ marginTop: '1rem' }}
        onClick={() => router.back()}
      >
        Back
      </Button>
      <h1>Managing {league.name}</h1>
      {/* Change name */}
      {/* Manage participants */}
      {/* Pending teams */}
      <PendingTeams pendingTeams={pendingTeams} />
      {/* Invite code */}
      <InviteCodeManager league={league} />
      {/* Reset */}
      {/* Delete */}
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

    let res = await fetch(
      `${process.env.API_BASE_URL}/api/leagues/${leagueId}`,
      {
        headers: {
          Cookie: ctx.req.headers.cookie,
        },
      }
    );
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

    res = await fetch(
      `${process.env.API_BASE_URL}api/leagues/${leagueId}/teams`,
      {
        headers: {
          Cookie: ctx.req.headers.cookie,
        },
      }
    );
    data = await res.json();
    const teams: Team[] = data.data;

    return { props: { league, teams } };
  },
});
