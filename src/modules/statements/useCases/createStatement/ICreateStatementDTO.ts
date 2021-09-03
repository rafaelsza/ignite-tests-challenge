import { OperationType, Statement } from "../../entities/Statement";

export interface ICreateStatementDTO {
  user_id: string;
  sender_id?: string;
  type: OperationType;
  amount: number;
  description: string;
}
