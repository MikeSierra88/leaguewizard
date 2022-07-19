import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Team } from '../../../models/TeamModel';
import useSWR from 'swr';
import {
  calculateTeamData,
  teamDataComparator,
} from '../../../lib/calculateTeamData';
import LeagueTable from '@components/league/league-table/LeagueTable';
import { useUser } from '@auth0/nextjs-auth0';

type Props = {
  leagueId: string,
  teams: Array<Team>,
};

const fetcher = async (url) => {
  const res = await fetch(url);
  return res.json();
};

const LeagueTableContainer = ({ leagueId, teams }: Props) => {
  const { data, error } = useSWR(`/api/leagues/${leagueId}/matches`, fetcher);
  const { user } = useUser();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(
      teams && data
        ? teams
            .map((team) => {
              const teamData = calculateTeamData(team, data.data);
              return {
                teamId: team._id,
                teamName: team.name,
                fifaTeam: team.fifaTeam,
                isOwner: user?.sub === team.owner,
                ...teamData,
              };
            })
            .sort(teamDataComparator)
            .map((teamRow, i) => {
              return {
                ...teamRow,
                place: i + 1,
              };
            })
        : []
    );
  }, [teams, data]);

  if (!data) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container sx={{ marginTop: '2rem' }}>
      <Box sx={{ overflow: 'auto' }}>
        <Typography variant="h6">Standings</Typography>
        <LeagueTable rowData={rows}></LeagueTable>
      </Box>
    </Container>
  );
};
export default LeagueTableContainer;
