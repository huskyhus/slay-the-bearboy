// 乱数はすべて本モジュールを経由することとし，`Math.random()`などは使用しない．
// 実装には mulberry32 を用いる．状態が符号なし32bit整数1つで済むため，`RngState`をそのままシリアライズでき，
// 可変なジェネレータ実体を持ち回る必要もない．
// 乱数の生成そのものも純粋関数として扱い，値と「次の状態」を組で返す．

export type RngState = number;

export function createRngState(seed: number): RngState {
  return seed >>> 0;
}

// 状態を1つ進め，[0, 1)の乱数と次の状態を返す．
function nextFloat(state: RngState): { value: number; state: RngState } {
  const next = (state + 0x6d2b79f5) >>> 0;
  let t = Math.imul(next ^ (next >>> 15), 1 | next);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 0x100000000, state: next };
}

// [0, maxInclusive]の整数と次の状態を返す．
function nextInt(
  state: RngState,
  maxInclusive: number,
): { value: number; state: RngState } {
  const next = nextFloat(state);
  return {
    value: Math.floor(next.value * (maxInclusive + 1)),
    state: next.state,
  };
}

// Fisher-Yatesシャッフル
// 元の配列は変更せず，並べ替えた新しい配列と次の乱数状態を返す．
export function shuffle<T>(
  array: readonly T[],
  state: RngState,
): { array: T[]; state: RngState } {
  const result = [...array];
  let rng = state;
  for (let i = result.length - 1; i > 0; i--) {
    const next = nextInt(rng, i);
    const j = next.value;
    rng = next.state;
    [result[i], result[j]] = [result[j], result[i]];
  }
  return { array: result, state: rng };
}
