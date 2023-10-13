import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';

@Controller()
export class SseController {

    @Sse('sse')
    sse(): Observable<MessageEvent>{
        return interval(1000).pipe(
            map((_)=>({data: {hello: 'world'}}))
        );
    }
}
