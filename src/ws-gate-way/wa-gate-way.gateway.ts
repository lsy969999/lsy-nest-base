import { Logger } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from "@nestjs/websockets";
import {Server} from 'socket.io'

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class WsGateWay{
    private readonly logger = new Logger(WsGateWay.name)

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: string) {
        this.logger.debug(message)
        this.server.emit('message', message)
    }
}