import { LotteryState, PrizeDefinition } from './types';

export const INITIAL_PRIZES_CONFIG: Omit<PrizeDefinition, 'slots'>[] = [
  {
    id: 'p1',
    order: 1,
    badgeNumber: '1',
    title: 'รางวัลที่ 1',
    itemDescription: 'รถยนต์โตโยต้าฟอร์จูนเนอร์ 2.4 LEADER G Plus',
    quantity: 2,
    digits: 5,
  },
  {
    id: 'p2',
    order: 2,
    badgeNumber: '2',
    title: 'รางวัลที่ 2',
    itemDescription: 'ทองคำแท่งน้ำหนัก 1 บาท',
    quantity: 3,
    digits: 5,
  },
  {
    id: 'p3',
    order: 3,
    badgeNumber: '3',
    title: 'รางวัลที่ 3',
    itemDescription: 'โทรศัพท์เคลื่อนที่ Apple iPhone 18 Pro',
    quantity: 3,
    digits: 5,
  },
  {
    id: 'p4',
    order: 4,
    badgeNumber: '4',
    title: 'รางวัลที่ 4',
    itemDescription: 'รถจักรยานยนต์ Honda Wave',
    quantity: 5,
    digits: 5,
  },
  {
    id: 'p5',
    order: 5,
    badgeNumber: '5',
    title: 'รางวัลที่ 5',
    itemDescription: 'ตู้เย็น 2 ประตู ขนาด 7 คิว',
    quantity: 10,
    digits: 5,
  },
  {
    id: 'p6',
    order: 6,
    badgeNumber: '6',
    title: 'รางวัลเลขท้าย 3 ตัว',
    itemDescription: 'พัดลมตั้งพื้น ขนาด 16 นิ้ว (100 รางวัล)',
    quantity: 100,
    digits: 3,
  },
  {
    id: 'p7',
    order: 7,
    badgeNumber: '7',
    title: 'รางวัลข้างเคียงรางวัลที่ 1',
    itemDescription: 'ทองคำแท่งน้ำหนัก 1 สลึง',
    quantity: 4,
    digits: 5,
    isAdjacent: true,
    adjacentSourceId: 'p1',
  },
];

export function createEmptySlots(prize: Omit<PrizeDefinition, 'slots'>): (string | null)[] {
  if (prize.digits === 3) {
    return [null];
  }
  return Array(prize.quantity).fill(null);
}

export const SAMPLE_LOTTERY_STATE: LotteryState = {
  year: '2570',
  title: 'ประกาศผลการออกรางวัลสลากกาชาด ประจำปี พ.ศ. 2570',
  organization: 'เหล่ากาชาดจังหวัดศรีสะเกษ',
  status: 'live',
  updatedAt: new Date().toISOString(),
  prizes: [
    {
      id: 'p1',
      order: 1,
      badgeNumber: '1',
      title: 'รางวัลที่ 1',
      itemDescription: 'รถยนต์โตโยต้าฟอร์จูนเนอร์ 2.4 LEADER G Plus',
      quantity: 2,
      digits: 5,
      slots: ['00051', '71827'],
    },
    {
      id: 'p2',
      order: 2,
      badgeNumber: '2',
      title: 'รางวัลที่ 2',
      itemDescription: 'ทองคำแท่งน้ำหนัก 1 บาท',
      quantity: 3,
      digits: 5,
      slots: ['49712', '69064', '69459'],
    },
    {
      id: 'p3',
      order: 3,
      badgeNumber: '3',
      title: 'รางวัลที่ 3',
      itemDescription: 'โทรศัพท์เคลื่อนที่ Apple iPhone 18 Pro',
      quantity: 3,
      digits: 5,
      slots: ['08066', '90951', '93311'],
    },
    {
      id: 'p4',
      order: 4,
      badgeNumber: '4',
      title: 'รางวัลที่ 4',
      itemDescription: 'รถจักรยานยนต์ Honda Wave',
      quantity: 5,
      digits: 5,
      slots: ['76592', '31856', '52085', '97692', '89311'],
    },
    {
      id: 'p5',
      order: 5,
      badgeNumber: '5',
      title: 'รางวัลที่ 5',
      itemDescription: 'ตู้เย็น 2 ประตู ขนาด 7 คิว',
      quantity: 10,
      digits: 5,
      slots: [
        '00143', '28893', '83551', '08711', '48165',
        '38174', '32643', '98324', '70478', '34944'
      ],
    },
    {
      id: 'p6',
      order: 6,
      badgeNumber: '6',
      title: 'รางวัลเลขท้าย 3 ตัว',
      itemDescription: 'พัดลมตั้งพื้น ขนาด 16 นิ้ว (100 รางวัล)',
      quantity: 100,
      digits: 3,
      slots: ['081'],
    },
    {
      id: 'p7',
      order: 7,
      badgeNumber: '7',
      title: 'รางวัลข้างเคียงรางวัลที่ 1',
      itemDescription: 'ทองคำแท่งน้ำหนัก 1 สลึง',
      quantity: 4,
      digits: 5,
      isAdjacent: true,
      adjacentSourceId: 'p1',
      slots: ['00050', '00052', '71826', '71828'],
    },
  ],
};

export function calculateAdjacentNumbers(p1Slots: (string | null)[]): (string | null)[] {
  const result: (string | null)[] = [null, null, null, null];

  const first1 = p1Slots[0];
  if (first1 && /^\d{5}$/.test(first1)) {
    const num = parseInt(first1, 10);
    const prev = (num - 1 + 100000) % 100000;
    const next = (num + 1) % 100000;
    result[0] = String(prev).padStart(5, '0');
    result[1] = String(next).padStart(5, '0');
  }

  const second1 = p1Slots[1];
  if (second1 && /^\d{5}$/.test(second1)) {
    const num = parseInt(second1, 10);
    const prev = (num - 1 + 100000) % 100000;
    const next = (num + 1) % 100000;
    result[2] = String(prev).padStart(5, '0');
    result[3] = String(next).padStart(5, '0');
  }

  return result;
}

export function getBlankState(): LotteryState {
  return {
    year: '2570',
    title: 'ประกาศผลการออกรางวัลสลากกาชาด ประจำปี พ.ศ. 2570',
    organization: 'เหล่ากาชาดจังหวัดศรีสะเกษ',
    status: 'live',
    updatedAt: new Date().toISOString(),
    prizes: INITIAL_PRIZES_CONFIG.map((cfg) => ({
      ...cfg,
      slots: createEmptySlots(cfg),
    })),
  };
}
