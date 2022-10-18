export interface Team {
  id?: string;
  league: string;
  name: string;
  fifaTeam: string;
  owner: string;
  createdDate?: Date;
  confirmed?: boolean;
}
