import React, { useState } from 'react';
import { Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import LoadingScreen from '@components/core/LoadingScreen';
import InviteCodeManager from '@components/league/manage/InviteCodeManager';
import PendingTeams from '@components/league/manage/PendingTeams';
import ResetLeagueSection from '@components/league/manage/ResetLeagueSection';
import DeleteLeagueSection from '@components/league/manage/DeleteLeagueSection';
import ChangeLeagueNameSection from '@components/league/manage/ChangeLeagueNameSection';
import ManageParticipantsSection from '@components/league/manage/ManageParticipantsSection';
import useSWR from 'swr';
import { fetchLeagueDetails, FetchLeagueDetailsResponse } from '../../../services/leagues.service';

const ManageLeaguePage = withPageAuthRequired(
  () => {
    const router = useRouter();

    const { leagueId } = router.query;
    const { data, error } = useSWR<FetchLeagueDetailsResponse>(leagueId, fetchLeagueDetails);

    if (!data) {
      return <LoadingScreen loading={true} />;
    }
    if (error) {
      return <div>Error: {error}</div>;
    }

    const { teams, league } = data;

    const [leagueName, setLeagueName] = useState(league.name);

    const pendingTeams = teams.filter((team) => {
      return team.confirmed === false;
    });

    const saveLeagueName = (name: string) => setLeagueName(name);

    return league ? (
      <Container>
        <Button variant="contained" sx={{ marginTop: '1rem' }} onClick={() => router.back()}>
          Back
        </Button>
        <h1>Managing {leagueName}</h1>
        {/* Pending teams */}
        <PendingTeams pendingTeams={pendingTeams} />
        {/* TODO: Pending matches */}
        {/* Change name */}
        <ChangeLeagueNameSection league={league} saveLeagueName={saveLeagueName.bind(this)} />
        {/* Manage participants */}
        <ManageParticipantsSection teams={teams} leagueOwner={league.owner} />
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
  },
  { returnTo: '/dashboard' }
);

export default ManageLeaguePage;
