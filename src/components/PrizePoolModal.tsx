import React from 'react';
import { LotteryState } from '@/lib/types';
import { X, Award } from 'lucide-react';

interface PrizePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  lottery: LotteryState;
}

export function PrizePoolModal({ isOpen, onClose, lottery }: PrizePoolModalProps) {
  if (!isOpen) return null;

  const totalPrizesCount = 127;
  let drawnPrizesCount = 0;

  lottery.prizes.forEach((p) => {
    if (p.digits === 3) {
      if (p.slots[0]) drawnPrizesCount += 100;
    } else {
      const drawn = p.slots.filter(Boolean).length;
      drawnPrizesCount += drawn;
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              รายละเอียดกองรางวัลสลากกาชาด ประจำปี 2570
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              จำนวนสลาก 99,999 ฉบับ • รวม 127 รางวัล
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status progress bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">ความคืบหน้าการออกรางวัล</span>
          <span className="font-mono text-slate-900 font-semibold">
            {drawnPrizesCount} / {totalPrizesCount} รางวัล ({Math.round((drawnPrizesCount / totalPrizesCount) * 100)}%)
          </span>
        </div>

        {/* Prize List */}
        <div className="p-4 sm:p-5 overflow-y-auto divide-y divide-slate-100 space-y-3">
          {lottery.prizes.map((p) => {
            const filledCount = p.digits === 3 
              ? (p.slots[0] ? 100 : 0) 
              : p.slots.filter(Boolean).length;
            const isCompleted = p.digits === 3 
              ? !!p.slots[0] 
              : filledCount === p.quantity;

            return (
              <div key={p.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono font-semibold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {p.badgeNumber}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {p.title}
                      </span>
                      {p.isAdjacent && (
                        <span className="text-[10px] text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded font-medium">
                          ข้างเคียงรางวัลที่ 1
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-0.5 font-medium">
                      {p.itemDescription}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-semibold text-slate-800 block">
                    {p.quantity} รางวัล
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded inline-block mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : filledCount > 0
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted
                      ? 'ออกครบแล้ว'
                      : filledCount > 0
                      ? `ออกแล้ว ${filledCount}/${p.quantity}`
                      : 'รอออกรางวัล'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          ผู้ถูกรางวัลนำสลากฉบับจริงมารับรางวัล ณ สำนักงานเหล่ากาชาดจังหวัดศรีสะเกษ
        </div>
      </div>
    </div>
  );
}
