import { Document, Model, model, Schema } from "mongoose";

const LeagueSchema = new Schema<LeagueDocument, LeagueModel>({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export interface League {
  name: string;
  date: Date;
}

interface LeagueBaseDocument extends League, Document {
  name: string;
  date: Date;
}

export interface LeagueDocument extends LeagueBaseDocument {

}

export interface LeagueModel extends Model<LeagueDocument> {
}

export default model<LeagueDocument, LeagueModel>("League", LeagueSchema);
