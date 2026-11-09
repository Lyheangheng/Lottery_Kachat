import { NextRequest, NextResponse } from 'next/server';
import { getLotteryState, saveLotteryState } from '@/lib/storage';
import { calculateAdjacentNumbers, getBlankState, SAMPLE_LOTTERY_STATE } from '@/lib/constants';

// Single admin authentication helper
function checkAdminAuth(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET || 'sisaket2570admin';
  const authHeader = req.headers.get('authorization');
  const cookie = req.cookies.get('admin_token')?.value;

  if (cookie === adminSecret || authHeader === `Bearer ${adminSecret}`) {
    return true;
  }
  return false;
}

export async function GET() {
  try {
    const state = await getLotteryState();
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error('Error fetching lottery state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lottery state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Only admin can modify lottery numbers' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;
    const state = await getLotteryState();

    if (action === 'reset_blank') {
      const blank = getBlankState();
      const saved = await saveLotteryState(blank);
      return NextResponse.json({ success: true, data: saved });
    }

    if (action === 'reset_sample') {
      const saved = await saveLotteryState(SAMPLE_LOTTERY_STATE);
      return NextResponse.json({ success: true, data: saved });
    }

    if (action === 'set_status') {
      const { status } = body;
      if (['live', 'completed', 'paused'].includes(status)) {
        state.status = status;
        const saved = await saveLotteryState(state);
        return NextResponse.json({ success: true, data: saved });
      }
    }

    if (action === 'update_slot') {
      const { prizeId, slotIndex, number } = body;
      const prize = state.prizes.find((p) => p.id === prizeId);
      if (!prize) {
        return NextResponse.json({ success: false, error: 'Prize not found' }, { status: 404 });
      }

      if (slotIndex < 0 || slotIndex >= prize.slots.length) {
        return NextResponse.json({ success: false, error: 'Invalid slot index' }, { status: 400 });
      }

      // Format number
      let formattedNumber: string | null = null;
      if (number !== null && number !== undefined && number.toString().trim() !== '') {
        const clean = number.toString().replace(/\D/g, '');
        formattedNumber = clean.padStart(prize.digits, '0').slice(-prize.digits);
      }

      prize.slots[slotIndex] = formattedNumber;

      // If updating 1st prize (p1), automatically recalculate adjacent numbers (p7)
      if (prizeId === 'p1') {
        const p7 = state.prizes.find((p) => p.id === 'p7');
        if (p7) {
          p7.slots = calculateAdjacentNumbers(prize.slots);
        }
      }

      const saved = await saveLotteryState(state);
      return NextResponse.json({ success: true, data: saved });
    }

    if (action === 'update_prize') {
      const { prizeId, slots } = body;
      const prize = state.prizes.find((p) => p.id === prizeId);
      if (!prize) {
        return NextResponse.json({ success: false, error: 'Prize not found' }, { status: 404 });
      }

      prize.slots = slots;

      if (prizeId === 'p1') {
        const p7 = state.prizes.find((p) => p.id === 'p7');
        if (p7) {
          p7.slots = calculateAdjacentNumbers(slots);
        }
      }

      const saved = await saveLotteryState(state);
      return NextResponse.json({ success: true, data: saved });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error modifying lottery numbers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update numbers' },
      { status: 500 }
    );
  }
}

