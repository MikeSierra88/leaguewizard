import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { ClientSession, Connection } from 'mongoose';
import dbConnect from '../../../../lib/dbConnect';
import LeagueModel, { League } from '../../../../models/LeagueModel';
import TeamModel, { Team } from '../../../../models/TeamModel';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { teamId } = req.query;
  const { user } = getSession(req, res);

  const connection: Connection = await dbConnect();
  let session: ClientSession;

  switch (method) {
    case 'POST':
      session = await connection.startSession();
      try {
        await session.startTransaction();
        const team = await TeamModel.findById<Team>(teamId);
        const league = await LeagueModel.findById<League>(team.league);
        if (user.sub !== league.owner) {
          await session.abortTransaction();
          await session.endSession();
          return res.status(401).json({ success: false });
        }
        await TeamModel.findByIdAndDelete(teamId);
        await LeagueModel.findByIdAndUpdate(league._id, {
          $pull: { participants: team.owner },
        });
        await session.commitTransaction();
        await session.endSession();
        return res.status(200).json({ success: true });
      } catch (e) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({ success: false, e });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
