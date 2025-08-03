export function interpolate(ts: number, before: any, after: any): number {
  const tsBefore = before.timestamp;
  const priceBefore = before.price;
  const tsAfter = after.timestamp;
  const priceAfter = after.price;

  const ratio = (ts - tsBefore) / (tsAfter - tsBefore);
  return priceBefore + (priceAfter - priceBefore) * ratio;
}
