import dbConnect from "../../lib/dbConnect";
import League from '../../models/League';

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        const leagues = await League.find({})
        res.status(200).json({ success: true, data: leagues })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        const league = await League.create(req.body)
        res.status(201).json({ success: true, data: league })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
