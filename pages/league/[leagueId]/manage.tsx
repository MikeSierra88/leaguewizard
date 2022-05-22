import React from 'react';
import { Button, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { League } from '../../../models/League';
import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import LoadingScreen from '@components/core/LoadingScreen';

type Props = {
  league: League,
};

const ManageLeaguePage = ({ league }: Props) => {
  const router = useRouter();

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
      {/* Invite code? */}
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

    console.log('Fetching league details', leagueId);
    const response = await fetch(
      `${process.env.API_BASE_URL}/api/leagues/${leagueId}`,
      {
        headers: {
          Cookie: ctx.req.headers.cookie,
        },
      }
    );
    const data = await response.json();
    const league: League = data.data;

    if (auth0User.user?.sub !== league.owner) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    return { props: { league } };
  },
});
