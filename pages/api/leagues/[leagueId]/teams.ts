import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../../../lib/dbConnect';
import League from '../../../../models/LeagueModel';
import Team from '../../../../models/TeamModel';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { leagueId } = req.query;
  const { user } = getSession(req, res);

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const league = await League.findById(leagueId);
        if (
          league.owner === user.sub ||
          league.participants.includes(user.sub)
        ) {
          const teams = await Team.find({ league: leagueId });
          return res.status(200).json({ success: true, data: teams });
        } else {
          return res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
  }
});
