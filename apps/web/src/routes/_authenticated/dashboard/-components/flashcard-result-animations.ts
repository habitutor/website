export const STYLES = `
  @keyframes riseFromBottom {
    from { opacity: 0; transform: translateY(90px) scaleY(0.85); }
    to   { opacity: 1; transform: translateY(0)    scaleY(1); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: translateY(36px) scale(0.85); }
    65%  { transform: translateY(-5px) scale(1.04); }
    100% { opacity: 1; transform: translateY(0)    scale(1); }
  }
  @keyframes fadeRow {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUpIn {
    from { opacity: 0; transform: translateY(56px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export const PODIUM_CFG: Record<number, { blockH: number; avatarW: number; delay: string }> = {
  1: { blockH: 180, avatarW: 140, delay: "0.3s" },
  2: { blockH: 140, avatarW: 120, delay: "0.1s" },
  3: { blockH: 120, avatarW: 100, delay: "0.5s" },
};

export const PODIUM_CFG_MOBILE: Record<number, { blockH: number; avatarW: number; delay: string }> = {
  1: { blockH: 120, avatarW: 80, delay: "0.3s" },
  2: { blockH: 100, avatarW: 65, delay: "0.1s" },
  3: { blockH: 80, avatarW: 55, delay: "0.5s" },
};

export const PODIUM_ORDER = [2, 1, 3] as const;
