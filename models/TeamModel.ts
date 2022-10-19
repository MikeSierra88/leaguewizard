export interface Team {
  id?: string;
  name: string;
  fifaTeam: string;
  owner: string;
  createdDate?: Date;
  confirmed?: boolean;
  leagueId: string;
}
