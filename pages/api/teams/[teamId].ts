import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import TeamModel, { Team } from '../../../models/TeamModel';
import LeagueModel from '../../../models/LeagueModel';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { teamId } = req.query;
  const { user } = getSession(req, res);

  switch (method) {
    case 'GET':
      try {
        const team = await TeamModel.findById<Team>(teamId);
        const league = await LeagueModel.findById(team.league);
        if (league.owner === user.sub || league.participants.includes(user.sub)) {
          return res.status(200).json({ success: true, data: team });
        }
        return res.status(401).json({ success: false });
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
