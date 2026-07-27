import { uniformInt } from "pure-rand/distribution/uniformInt";
import {
  xoroshiro128plus,
  xoroshiro128plusFromState,
} from "pure-rand/generator/xoroshiro128plus";

// 乱数はすべて本モジュールを経由することとし，`Math.random()`などは使用しない．
// pure-rand のジェネレータ（`RandomGenerator`）は`next()`で自身を破壊的に更新する（そのため，純粋性を保つためには，毎回忘れずに`clone()`する必要がある）上に，シリアライズ不可能である．
// そのため，外部にはシリアライズ可能なスナップショット（`RngState`）だけを公開し，可変なジェネレータと pure-rand への依存は本モジュールに閉じ込める．

export type RngState = readonly number[];

export function createRngState(seed: number): RngState {
  return xoroshiro128plus(seed).getState();
}

// Fisher-Yatesシャッフル
// 元の配列は変更せず，並べ替えた新しい配列と次の乱数状態を返す．
export function shuffle<T>(
  array: readonly T[],
  state: RngState,
): { array: T[]; state: RngState } {
  const rng = xoroshiro128plusFromState(state);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = uniformInt(rng, 0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return { array: result, state: rng.getState() };
}
