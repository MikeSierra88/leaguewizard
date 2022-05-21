import { useEffect, useState } from "react";
import { Box, CircularProgress, Container } from "@mui/material";
import LeagueListItem from "@components/dashboard/leagues/league-list-item";
import { League } from "../../models/League";

const DashLeagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  const fetchLeagues = () => {
    setLoading(true);
    fetch("api/leagues")
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        setLeagues(json.data);
      })
      .catch(err => {
        console.error("Error while fetching leagues", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteLeague = (leagueId: string) => {
    setLoading(true);
    fetch(`api/leagues/${leagueId}`, {
      method: "DELETE"
    })
      .then(() => {
        setLeagues(leagues.filter(league => league._id !== leagueId));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // load leagues from API
  useEffect(() => {
    fetchLeagues();
  }, []);

  const leagueArray = leagues.map(league => {
    return (<LeagueListItem key={league._id} league={league} deleteLeague={deleteLeague} />);
  });

  return isLoading ? (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <CircularProgress />
    </Box>
  ) : (
    <Container>
      <h1>Leagues</h1>
      {leagueArray}
    </Container>

  );
};

export default DashLeagues;
