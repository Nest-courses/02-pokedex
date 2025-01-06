import { Module } from '@nestjs/common';
import { AxiosAdapter } from './adapterts/axios-adapter';
import { HttpAdapter } from './interfaces/http.adapter';
import { FetchAdapter } from './adapterts/fetch.adapter';

@Module({
  providers: [
    AxiosAdapter,
    FetchAdapter,
    { provide: HttpAdapter, useExisting: FetchAdapter },
  ],
  exports: [HttpAdapter],
})
export class CommonModule {}
