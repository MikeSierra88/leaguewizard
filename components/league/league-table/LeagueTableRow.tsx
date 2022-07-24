import React from 'react';
import { Button, TableCell, TableRow, Tooltip } from '@mui/material';
import MuiNextLink from '@components/navigation/MuiNextLink';
import AddIcon from '@mui/icons-material/Add';

type Props = {
  place: number,
  teamId: string,
  leagueId: string,
  isOwner: boolean,
  isConfirmed: boolean,
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
  leagueId,
  teamName,
  isOwner,
  isConfirmed,
  fifaTeam,
  matchesPlayed = 0,
  points = 0,
  goalsFor = 0,
  goalsAgainst = 0,
  goalDiff = 0,
}: Props) => {
  const addMatchButton =
    isOwner && isConfirmed ? (
      <MuiNextLink href={`/leagues/${leagueId}/new-match`} variant="button" underline="hover" sx={{ marginInlineEnd: '0.5rem' }}>
        <Tooltip title="Add new match">
          <Button variant="outlined" size="small" color="success">
            <AddIcon />
          </Button>
        </Tooltip>
      </MuiNextLink>
    ) : (
      <></>
    );

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {place}
      </TableCell>
      <TableCell sx={{ width: '1px', whiteSpace: 'nowrap' }}>{teamName}</TableCell>
      <TableCell sx={{ width: '1px', whiteSpace: 'nowrap' }}>{fifaTeam}</TableCell>
      <TableCell align="right">{matchesPlayed}</TableCell>
      <TableCell align="right">{goalsFor}</TableCell>
      <TableCell align="right">{goalsAgainst}</TableCell>
      <TableCell align="right">{goalDiff}</TableCell>
      <TableCell align="right">{points}</TableCell>
      <TableCell>
        <MuiNextLink href={`/teams/${teamId}`} variant="button" underline="hover" sx={{ marginInlineEnd: '0.5rem' }}>
          <Button variant="outlined" size="small" color="primary">
            Details
          </Button>
        </MuiNextLink>
        {addMatchButton}
      </TableCell>
    </TableRow>
  );
};

export default LeagueTableRow;
