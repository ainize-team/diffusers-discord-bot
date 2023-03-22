export interface ITxResult {
  status: string;
  tx_hash: { [status: string]: string };
  updated_at: number;
}
