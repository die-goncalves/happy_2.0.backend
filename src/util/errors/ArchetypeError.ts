import status, { HttpStatusClasses, HttpStatusExtra } from 'http-status';

export interface archetypeError {
  code: number;
  message: string;
  description?: string;
  documentation?: string;
}
export interface archetypeErrorResponse extends archetypeError {
  name: string | number | HttpStatusClasses | HttpStatusExtra;
}

export default class ArchetypeError {
  public static pack(error: archetypeError): archetypeErrorResponse {
    return {
      code: error.code,
      name: status[`${error.code}_NAME`],
      message: error.message,
      ...(error.documentation && { documentation: error.documentation }),
      ...(error.description && { description: error.description }),
    };
  }
}
