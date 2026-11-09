export interface PrizeSlot {
  index: number;
  number: string | null; // e.g. "00051" or null if not yet drawn
}

export interface PrizeDefinition {
  id: string; // "p1", "p2", etc.
  order: number; // 1 to 7
  badgeNumber: string; // "1", "2", "3", "4", "5", "6", "7"
  title: string; // e.g. "รางวัลที่ 1"
  itemDescription: string; // e.g. "รถยนต์โตโยต้าฟอร์จูนเนอร์ 2.4 LEADER G Plus"
  quantity: number; // 2, 3, 3, 5, 10, 100, 4
  digits: number; // 5 or 3
  isAdjacent?: boolean; // true for p7
  adjacentSourceId?: string; // "p1"
  slots: (string | null)[]; // length equal to quantity (or for 3-digit: 1 winning 3-digit number covers 100 prizes)
}

export interface LotteryState {
  year: string; // "2570"
  title: string; // "ประกาศผลการออกรางวัลสลากกาชาด ประจำปี พ.ศ. 2570"
  organization: string; // "เหล่ากาชาดจังหวัดศรีสะเกษ"
  status: 'live' | 'completed' | 'paused';
  updatedAt: string;
  prizes: PrizeDefinition[];
}

