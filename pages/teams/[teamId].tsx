import { Team } from '../../models/TeamModel';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Button, Container, Stack, Typography } from '@mui/material';
import MuiNextLink from '@components/navigation/MuiNextLink';
import React from 'react';
import MatchesTable from '@components/league/matches-table/MatchesTable';
import ManageTeamButton from '@components/team/ManageTeamButton';
import ViewOnlyInfo from '@components/league/ViewOnlyInfo';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { fetchTeamDetails } from '../../services/teams.service';
import LoadingScreen from '@components/core/LoadingScreen';

const TeamDetailsPage = withPageAuthRequired(
  () => {
    const { user } = useUser();
    const router = useRouter();

    const { teamId } = router.query;
    const { data: team, error } = useSWR<Team>(teamId, fetchTeamDetails);

    if (!team) {
      return <LoadingScreen loading={true} />;
    }
    if (error) {
      return <div>Error: {error}</div>;
    }

    return (
      <Container>
        <Stack direction="row" justifyContent="space-between" sx={{ marginTop: '1rem' }}>
          <MuiNextLink href={`/leagues/${team?.leagueId}`} underline="none">
            <Button variant="contained">Back to league</Button>
          </MuiNextLink>
          <ManageTeamButton
            isOwner={user?.sub === team?.owner}
            isTeamConfirmed={team?.confirmed}
            teamId={team?.id}
            leagueId={team?.leagueId}
          />
        </Stack>
        <Container>
          <Stack sx={{ marginTop: '1rem' }}>
            <Typography variant="h4">{team.name}</Typography>
            <Typography variant="h5">{team.fifaTeam}</Typography>
          </Stack>
        </Container>
        <ViewOnlyInfo confirmed={team.confirmed} />
        <MatchesTable leagueId={team?.leagueId} teamId={team?.id} />
      </Container>
    );
  },
  { returnTo: '/dashboard' }
);

export default TeamDetailsPage;
