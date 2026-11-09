import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { LotteryState } from './types';
import { SAMPLE_LOTTERY_STATE } from './constants';
import { LotteryStateModel } from '@/models/LotteryState';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'lottery-state.json');

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return false;

  if (cached?.conn) {
    return true;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };
    cached!.promise = mongoose.connect(uri, opts).then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
    console.log('[Database] Connected to MongoDB successfully');
    return true;
  } catch (err) {
    cached!.promise = null;
    console.warn('[Database] MongoDB connection failed, using local file storage:', err);
    return false;
  }
}

function readLocalFile(): LotteryState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SAMPLE_LOTTERY_STATE, null, 2), 'utf-8');
      return SAMPLE_LOTTERY_STATE;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local data file:', e);
    return SAMPLE_LOTTERY_STATE;
  }
}

function writeLocalFile(state: LotteryState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local data file:', e);
  }
}

export async function getLotteryState(): Promise<LotteryState> {
  const mongoOk = await connectMongo();
  if (mongoOk) {
    try {
      const doc = await LotteryStateModel.findOne().lean();
      if (!doc) {
        // Seed MongoDB from the current local file state so data is preserved
        const currentData = readLocalFile();
        const initial = await LotteryStateModel.create(currentData);
        console.log('[Database] Seeded MongoDB with current lottery data');
        return initial.toObject() as LotteryState;
      }
      return doc as unknown as LotteryState;
    } catch (e) {
      console.error('Error querying MongoDB:', e);
    }
  }
  return readLocalFile();
}

export async function saveLotteryState(state: LotteryState): Promise<LotteryState> {
  state.updatedAt = new Date().toISOString();
  const mongoOk = await connectMongo();
  if (mongoOk) {
    try {
      let doc = await LotteryStateModel.findOne();
      if (!doc) {
        doc = await LotteryStateModel.create(state);
      } else {
        doc.set(state);
        await doc.save();
      }
      // Also sync to local backup file
      writeLocalFile(state);
      return doc.toObject() as LotteryState;
    } catch (e) {
      console.error('Error updating MongoDB:', e);
    }
  }
  writeLocalFile(state);
  return state;
}
