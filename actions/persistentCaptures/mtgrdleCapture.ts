import {
    Hours,
    hoursToMilliseconds,
    MessageType,
    PersistentReplyCaptureBuilder
} from 'chz-telegram-bot';
import { CardInfo, mtgrdleService } from '../../services/mtgrdleService';

export const mtgrdleCapture = new PersistentReplyCaptureBuilder<{
    card: CardInfo;
}>('Capture.Mtgrdle')
    .on(MessageType.Text)
    .expiresAfter(hoursToMilliseconds(20 as Hours))
    .do((replyCtx, data) => mtgrdleService.handleGuess(replyCtx, data.card))
    .withRatelimit(1)
    .build();
