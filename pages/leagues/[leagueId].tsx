import React from 'react';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Button, Container, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MuiNextLink from '@components/navigation/MuiNextLink';
import LeagueViewOnlyInfo from '@components/league/ViewOnlyInfo';
import ManageLeagueButton from '@components/league/ManageLeagueButton';
import MatchesTable from '@components/league/matches-table/MatchesTable';
import LeagueTableContainer from '@components/league/league-table/LeagueTableContainer';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { fetchLeagueDetails, FetchLeagueDetailsResponse } from '../../services/leagues.service';
import LoadingScreen from '@components/core/LoadingScreen';

const LeagueDetailsPage = withPageAuthRequired(
  () => {
    const { user } = useUser();
    const router = useRouter();

    const { leagueId } = router.query;
    const { data, error } = useSWR<FetchLeagueDetailsResponse>(leagueId, fetchLeagueDetails);

    if (!data) {
      return <LoadingScreen loading={true} />;
    }
    if (error) {
      return <div>Error: {error}</div>;
    }

    const { league, teams, matches } = data;

    const ownTeam = teams.find((team) => team.owner === user?.sub);

    return (
      <Container>
        <Stack direction="row" justifyContent="space-between" sx={{ marginTop: '1rem' }}>
          <MuiNextLink href="/dashboard" underline="none">
            <Button variant="contained">Back</Button>
          </MuiNextLink>
          <ManageLeagueButton isOwner={user?.sub === league.owner} leagueId={league.id} />
        </Stack>
        <LeagueViewOnlyInfo confirmed={ownTeam?.confirmed} />
        <h1>
          {league.name}
          {user?.sub === league.owner ? (
            <MuiNextLink href={`/leagues/${league.id}/manage`} underline="none" sx={{ marginLeft: '0.5rem' }}>
              <EditIcon />
            </MuiNextLink>
          ) : (
            <></>
          )}
        </h1>
        <LeagueTableContainer teams={teams} leagueId={league.id} matches={matches} />
        <MatchesTable leagueId={league.id} />
      </Container>
    );
  },
  { returnTo: '/dashboard' }
);

export default LeagueDetailsPage;
