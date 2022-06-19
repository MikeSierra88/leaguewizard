import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../../lib/dbConnect';
import League from '../../../models/LeagueModel';
import InviteCode from '../../../models/InviteCodeModel';

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
          const extendedLeague = await league.populate({
            path: 'inviteCode',
            model: InviteCode,
          });
          return res.status(200).json({ success: true, data: extendedLeague });
        }
        if (league.participants.includes(user.sub)) {
          const limitedLeague = await League.findById(
            leagueId,
            '-inviteCode -owner -participants'
          );
          console.log(limitedLeague);
          return res.status(200).json({ success: true, data: limitedLeague });
        } else {
          return res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'PATCH':
      try {
        const updatedLeague = await League.findByIdAndUpdate(
          leagueId,
          req.body,
          { returnDocument: 'after' }
        );
        return res.status(200).json({ success: true, data: updatedLeague });
      } catch (error) {
        console.error('Error while processing PATCH', error);
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      try {
        const league = await League.findById(leagueId);
        if (league.owner === user.sub) {
          await League.findByIdAndDelete(leagueId);
          return res.status(204).end();
        } else {
          return res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing DELETE', error);
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
