import { Button } from "@mui/material";

const LeagueListItem = ({ league, deleteLeague }) => {
  const handleDelete = () => {
    deleteLeague(league._id)
  };

  return (
    <div>
      <p>{league.name}</p>
      <Button onClick={handleDelete}>Delete</Button>
    </div>
  );

}

export default LeagueListItem;
