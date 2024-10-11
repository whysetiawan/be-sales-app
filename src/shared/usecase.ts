/* eslint-disable @typescript-eslint/no-unused-vars */
export interface UseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse> | IResponse;
}
