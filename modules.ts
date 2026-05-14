export default interface user {
    readonly name: string,
    readonly email: string,
    readonly password: string,
    readonly salary: number,
    transactions: transaction[],
}

export interface transaction {
    readonly date: string,
    readonly amount: number,
    readonly type: "Income"|"Expense",
}

export interface calData {
    readonly totalBalance: number,
    readonly totalIncome: number,
    readonly totalExpense: number,
}

export interface userData {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly salary: number;
  readonly transactions: Array<object>;
}

export type income = "Income"|"Expense";