import { Document, Model, model, models, Schema } from "mongoose";

const LeagueSchema = new Schema<LeagueDocument, LeagueModel>({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

export interface League {
  _id?: string;
  name: string;
  owner: string;
  createdDate: Date;
}

interface LeagueBaseDocument extends League, Document {
  _id?: string;
  name: string;
  owner: string;
  createdDate: Date;
}

export interface LeagueDocument extends LeagueBaseDocument {
}

export interface LeagueModel extends Model<LeagueDocument> {
}

export default models.League || model<LeagueDocument, LeagueModel>("League", LeagueSchema);
