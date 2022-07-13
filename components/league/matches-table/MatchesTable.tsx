import React from 'react';
import useSWR from 'swr';
import { Match } from '../../../models/MatchModel';
import { Container, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DateTime } from 'luxon';

type Props = {
  leagueId: string;
  teamId?: string;
};

const fetcher = async (url) => {
  const res = await fetch(url);
  return res.json();
};

const MatchesTable = ({ leagueId, teamId }: Props) => {
  const apiUri = teamId
    ? `/api/leagues/${leagueId}/matches?team=${teamId}`
    : `/api/leagues/${leagueId}/matches`;
  const { data, error } = useSWR(apiUri, fetcher);

  if (!data) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'Date', minWidth: 80 },
    { field: 'homeTeam', headerName: 'Home team', minWidth: 150 },
    { field: 'homeFifaTeam', headerName: 'In-game', minWidth: 100 },
    { field: 'homeScore', headerName: 'Gls', width: 50, sortable: false },
    { field: 'awayScore', headerName: 'Gls', width: 50, sortable: false },
    { field: 'awayFifaTeam', headerName: 'In-game', minWidth: 100 },
    { field: 'awayTeam', headerName: 'Away team', minWidth: 150 },
  ];

  const rows = data.data.map((match: Match) => ({
    id: match._id,
    date: DateTime.fromISO(match.createdDate).toISODate(),
    homeTeam: (match.homeTeam as any).name,
    homeFifaTeam: (match.homeTeam as any).fifaTeam,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    awayFifaTeam: (match.awayTeam as any).fifaTeam,
    awayTeam: (match.awayTeam as any).name,
  }));

  return (
    <Container sx={{ marginTop: '2rem' }}>
      <Typography variant="h6">Matches</Typography>
      <DataGrid
        autoHeight
        getRowId={(row) => row.id}
        columns={columns}
        rows={rows}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Container>
  );
};

export default MatchesTable;
