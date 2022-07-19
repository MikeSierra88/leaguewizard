import React from 'react';
import { Button, TableCell, TableRow } from '@mui/material';
import MuiNextLink from '@components/navigation/MuiNextLink';

type Props = {
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

const LeagueTableRow = ({
  place,
  teamId,
  teamName,
  fifaTeam,
  matchesPlayed = 0,
  points = 0,
  goalsFor = 0,
  goalsAgainst = 0,
  goalDiff = 0,
}: Props) => {
  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {place}
      </TableCell>
      <TableCell sx={{ width: '1px', whiteSpace: 'nowrap' }}>
        {teamName}
      </TableCell>
      <TableCell sx={{ width: '1px', whiteSpace: 'nowrap' }}>
        {fifaTeam}
      </TableCell>
      <TableCell align="right">{matchesPlayed}</TableCell>
      <TableCell align="right">{goalsFor}</TableCell>
      <TableCell align="right">{goalsAgainst}</TableCell>
      <TableCell align="right">{goalDiff}</TableCell>
      <TableCell align="right">{points}</TableCell>
      <TableCell>
        <MuiNextLink
          href={`/teams/${teamId}`}
          variant="button"
          underline="hover"
          sx={{ marginInlineEnd: '0.5rem' }}
        >
          <Button variant="outlined" size="small">
            Details
          </Button>
        </MuiNextLink>
      </TableCell>
    </TableRow>
  );
};

export default LeagueTableRow;
