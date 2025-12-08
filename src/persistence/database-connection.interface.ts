import { type ITask } from 'pg-promise'

export type Transaction = ITask<unknown>

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

export abstract class IDatabaseConnection {
  public abstract transactional<T>(
    callback: (tx: Transaction) => Promise<T>,
  ): Promise<T>
}
