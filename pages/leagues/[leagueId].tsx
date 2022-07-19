import React from 'react';
import { League } from '../../models/LeagueModel';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Button, Container, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MuiNextLink from '@components/navigation/MuiNextLink';
import { Team } from '../../models/TeamModel';
import LeagueViewOnlyInfo from '@components/league/ViewOnlyInfo';
import ManageLeagueButton from '@components/league/ManageLeagueButton';
import MatchesTable from '@components/league/matches-table/MatchesTable';
import LeagueTableContainer from '@components/league/league-table/LeagueTableContainer';

type Props = {
  league: League,
  teams: Array<Team>,
};

const LeagueDetailsPage = ({ league, teams }: Props) => {
  const { user } = useUser();
  const ownTeam = teams.find((team) => team.owner === user.sub);

  return (
    <Container>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ marginTop: '1rem' }}
      >
        <MuiNextLink href="/dashboard" underline="none">
          <Button variant="contained">Back</Button>
        </MuiNextLink>
        <ManageLeagueButton
          isOwner={user?.sub === league.owner}
          leagueId={league._id}
        />
      </Stack>
      <LeagueViewOnlyInfo confirmed={ownTeam?.confirmed} />
      <h1>
        {league.name}
        {user.sub === league.owner ? (
          <MuiNextLink
            href={`/leagues/${league._id}/manage`}
            underline="none"
            sx={{ marginLeft: '0.5rem' }}
          >
            <EditIcon />
          </MuiNextLink>
        ) : (
          <></>
        )}
      </h1>
      <LeagueTableContainer teams={teams} leagueId={league._id} />
      <MatchesTable leagueId={league._id} />
    </Container>
  );
};

export default LeagueDetailsPage;

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
