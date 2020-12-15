//Arquivo responsavel por inicializar o servidor para todos os testes funcionais
import { SetupServer } from '@src/server';
import supertest from 'supertest';

let server: SetupServer;
beforeAll(async () => {
  //roda antes de todos os testes da aplicação
  server = new SetupServer();
  await server.init();
  global.testRequest = supertest(server.getApp());
});

afterAll(async () => await server.close());
