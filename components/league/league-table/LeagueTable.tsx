import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import LeagueTableRow from '@components/league/league-table/LeagueTableRow';

export type LeagueTableRowData = {
  place: number,
  teamId: string,
  teamName: string,
  fifaTeam: string,
  matchesPlayed: number,
  points: number,
  goalsFor: number,
  goalsAgainst: number,
  goalDiff: number,
};

type Props = {
  rowData: Array<LeagueTableRowData>,
};

const LeagueTable = ({ rowData }: Props) => {
  const rows = rowData.map((props: LeagueTableRowData) => (
    <LeagueTableRow key={props.teamId} {...props} />
  ));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Place</TableCell>
            <TableCell sx={{ width: '1px', whiteSpace: 'nowrap' }}>
              Name
            </TableCell>
            <TableCell sx={{ width: '1px', whiteSpace: 'nowrap' }}>
              In-game team
            </TableCell>
            <TableCell align="right">Pld</TableCell>
            <TableCell align="right">GF</TableCell>
            <TableCell align="right">GA</TableCell>
            <TableCell align="right">GD</TableCell>
            <TableCell align="right">Pts</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};
export default LeagueTable;
