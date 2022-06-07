import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../../lib/dbConnect';
import League from '../../../models/League';
import InviteCode from '../../../models/InviteCode';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { leagueId } = req.query;
  const { user } = getSession(req, res);

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const league = await League.findById(leagueId);
        if (league.owner === user.sub) {
          league.populate({ path: 'inviteCode', model: InviteCode });
          res.status(200).json({ success: true, data: league });
        }
        if (league.participants.includes(user.sub)) {
          const limitedLeague = await League.findById(
            leagueId,
            '-inviteCode -owner -participants'
          );
          console.log(limitedLeague);
          res.status(200).json({ success: true, data: limitedLeague });
        } else {
          res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing GET', error);
        res.status(400).json({ success: false, error });
      }
      break;
    case 'PATCH':
      try {
        const updatedLeague = await League.findByIdAndUpdate(
          leagueId,
          req.body,
          { returnDocument: 'after' }
        );
        res.status(200).json({ success: true, data: updatedLeague });
      } catch (error) {
        console.error('Error while processing PATCH', error);
        res.status(400).json({ success: false, error });
      }
      break;
    case 'DELETE':
      try {
        const league = await League.findById(leagueId);
        if (league.owner === user.sub) {
          await League.findByIdAndDelete(leagueId);
          res.status(204).end();
        } else {
          res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing DELETE', error);
        res.status(400).json({ success: false, error });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
});
