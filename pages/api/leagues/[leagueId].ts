import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../../lib/dbConnect';
import League from '../../../models/League';

export default withApiAuthRequired(async function handler(req, res) {
  const { method } = req;
  const { leagueId } = req.query;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const league = await League.findById(leagueId);
        res.status(200).json({ success: true, data: league });
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
        await League.findByIdAndDelete(leagueId);
        res.status(204).end();
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
