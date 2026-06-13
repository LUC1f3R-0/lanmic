import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceInfo(): {
    name: string;
    status: 'ok';
    timestamp: string;
  } {
    return {
      name: 'LANMIC API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
