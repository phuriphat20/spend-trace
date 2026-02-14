export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}