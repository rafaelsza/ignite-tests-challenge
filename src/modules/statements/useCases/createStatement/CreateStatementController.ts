import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { OperationType } from '../../entities/Statement';

import { CreateStatementUseCase } from './CreateStatementUseCase';

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const splittedPath = request.originalUrl.split('/')
    const type = splittedPath[user_id ? splittedPath.length - 2 : splittedPath.length - 1] as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    if (type === 'transfer') {
      await createStatement.execute({
        user_id,
        sender_id: id,
        type,
        amount,
        description
      })
    }

    const statement = await createStatement.execute({
      user_id: id,
      type,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}
