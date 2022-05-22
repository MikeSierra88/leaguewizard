import React from 'react';
import { League } from '../../models/League';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Button, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

type Props = {
  league: League
}

const LeagueDetailsPage = ({ league }: Props) => {
  const deleteLeague = () => {
    fetch(`/api/leagues/${league._id}`, {
      method: 'DELETE'
    })
      .then(() => {
        console.log('League deleted');
      })
      .catch((err) => console.error(err));
  };

  return (
    <Container>
      <h1>{league.name}</h1>
      <Button variant='contained' size='small' color='error' onClick={deleteLeague}>
        <DeleteIcon  />
      </Button>
    </Container>
  );
};

export default LeagueDetailsPage;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { leagueId } = ctx.params;

    const res = await fetch(`${process.env.API_BASE_URL}api/leagues/${leagueId}`, {
      headers: {
        Cookie: ctx.req.headers.cookie
      }
    });
    console.log('Fetched league details', res);
    const data = await res.json();
    console.log('JSON data', data);

    return { props: { league: data.data } };
  }
});


