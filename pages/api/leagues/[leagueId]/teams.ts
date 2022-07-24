import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../../../lib/dbConnect';
import LeagueModel from '../../../../models/LeagueModel';
import TeamModel from '../../../../models/TeamModel';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { leagueId } = req.query;
  const { user } = getSession(req, res);

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const league = await LeagueModel.findById(leagueId);
        if (league.owner === user.sub || league.participants.includes(user.sub)) {
          const teams = await TeamModel.find({ league: leagueId });
          return res.status(200).json({ success: true, data: teams });
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
