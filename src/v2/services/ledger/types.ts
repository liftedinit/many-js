export interface Balance {
  balances: Map<string, number>
}

export interface BalanceArgs {
  address?: string
  tokens?: string[]
}

export interface SendArgs {
  from?: string
  to: string
  amount: number
  token: string
}
