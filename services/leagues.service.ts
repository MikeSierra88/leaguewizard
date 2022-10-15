import { Fetcher } from 'swr';
import { Team } from '../models/TeamModel';
import { League } from '../models/LeagueModel';
import axios from 'axios';
import { MatchWithTeamData } from './matches.service';

export interface FetchLeagueDetailsResponse {
  league: League;
  teams: Array<Team>;
  matches: Array<MatchWithTeamData>;
}

export const fetchLeagueDetails: Fetcher<FetchLeagueDetailsResponse> = async (leagueId: string) => {
  const leagueRes = await axios.get(`/api/leagues/${leagueId}`);
  const league = leagueRes.data.data;
  const teamsRes = await axios.get(`/api/leagues/${leagueId}/teams`);
  const teams = teamsRes.data.data;
  const matchesRes = await axios.get(`/api/leagues/${leagueId}/matches`);
  const matches = matchesRes.data.data;
  return { league, teams, matches };
};
