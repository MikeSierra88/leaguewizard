import React from 'react';
import { Container, Typography } from '@mui/material';
import NewMatchForm from '@components/matches/NewMatchForm';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { League } from '../../../models/LeagueModel';
import { Team } from '../../../models/TeamModel';

type Props = {
  teams: Team[],
  league: League,
};

const NewMatchPage = ({ teams, league }: Props) => {
  return (
    <Container sx={{ marginTop: '1rem' }}>
      <Typography variant="h5">Add new match</Typography>
      <NewMatchForm league={league} teams={teams} />
    </Container>
  );
};

export default NewMatchPage;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { leagueId } = ctx.params;

    // fetch league
    let res = await fetch(
      `${process.env.API_BASE_URL}api/leagues/${leagueId}`,
      {
        headers: {
          Cookie: ctx.req.headers.cookie,
        },
      }
    );
    let data = await res.json();
    const league: League = data.data;
    // fetch teams
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
