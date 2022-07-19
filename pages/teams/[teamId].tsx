import { Team } from '../../models/TeamModel';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Button, Container, Stack, Typography } from '@mui/material';
import MuiNextLink from '@components/navigation/MuiNextLink';
import React from 'react';
import MatchesTable from '@components/league/matches-table/MatchesTable';
import ManageTeamButton from '@components/team/ManageTeamButton';
import ViewOnlyInfo from '@components/league/ViewOnlyInfo';

type Props = {
  team: Team,
};

const TeamDetailsPage = ({ team }: Props) => {
  const { user } = useUser();

  return (
    <Container>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ marginTop: '1rem' }}
      >
        <MuiNextLink href={`/leagues/${team?.league}`} underline="none">
          <Button variant="contained">Back to league</Button>
        </MuiNextLink>
        <ManageTeamButton
          isOwner={user?.sub === team?.owner}
          isTeamConfirmed={team?.confirmed}
          teamId={team?._id}
          leagueId={team?.league}
        />
      </Stack>
      <Container>
        <Stack sx={{ marginTop: '1rem' }}>
          <Typography variant="h4">{team.name}</Typography>
          <Typography variant="h5">{team.fifaTeam}</Typography>
        </Stack>
      </Container>
      <ViewOnlyInfo confirmed={team.confirmed} />
      <MatchesTable leagueId={team?.league} teamId={team?._id} />
    </Container>
  );
};

export default TeamDetailsPage;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { teamId } = ctx.params;

    // fetch team
    let res = await fetch(`${process.env.API_BASE_URL}api/teams/${teamId}`, {
      headers: {
        Cookie: ctx.req.headers.cookie,
      },
    });
    let data = await res.json();
    const team: Team = data.data;

    return { props: { team } };
  },
});
