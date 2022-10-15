import { Team } from '../models/TeamModel';
import { Fetcher } from 'swr';
import axios from 'axios';

export const fetchTeamDetails: Fetcher<Team> = async (teamId: string) => {
  const teamRes = await axios.get(`/api/teams/${teamId}`);
  return teamRes.data.data;
};
