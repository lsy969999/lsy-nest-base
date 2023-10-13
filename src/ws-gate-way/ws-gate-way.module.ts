import { Module } from '@nestjs/common';
import { WsGateWay } from './wa-gate-way.gateway';

@Module({
    providers: [WsGateWay]
})
export class WsGateWayModule {}
