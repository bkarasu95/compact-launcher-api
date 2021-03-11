import * as mongoose from 'mongoose'
import { IProgram } from '../../../@types/common/program'
export interface ProgramModel extends IProgram, mongoose.Document {}

const ProgramSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  content: {
    type: String,
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  images: [
    {
      path: {
        type: String,
      },
    },
  ],
  deletedAt: {
    type: Date,
    default: null,
  },
})
// TODO add the deleted_at support generally
export const Program = mongoose.model<ProgramModel>('Program', ProgramSchema)
