import { BotEventType, BotEventArgumentsMap } from 'chz-telegram-bot';
import { metricsCollector } from './metricsCollector';

// Helper type to extract event data with traceId
type EventData<K extends keyof BotEventArgumentsMap> = {
    traceId: string;
} & BotEventArgumentsMap[K];

// Type aliases for cleaner code
type MessageEventData = EventData<typeof BotEventType.messageRecieved>;
type BeforeActionsEventData = EventData<
    typeof BotEventType.beforeActionsExecuting
>;
type CommandEventData = EventData<typeof BotEventType.commandActionExecuting>;
type InlineQueryEventData = EventData<typeof BotEventType.inlineQueryRecieved>;
type InlineActionEventData = EventData<
    typeof BotEventType.inlineActionExecuting
>;
type InlineAbortEventData = EventData<
    typeof BotEventType.inlineProcessingAborted
>;
type ScheduledEventData = EventData<
    typeof BotEventType.scheduledActionExecuting
>;
type ApiEventData = EventData<typeof BotEventType.apiRequestSending>;
type CaptureEventData = EventData<
    typeof BotEventType.commandActionCaptureStarted
>;
type ErrorEventData = EventData<typeof BotEventType.error>;

export function createMonitoringEventHandler(botName: string) {
    // Register the bot with metrics collector
    metricsCollector.registerBot(botName);

    return (event: string, _timestamp: number, data: unknown) => {
        try {
            const baseData = data as { traceId: string };
            const traceId = baseData?.traceId;

            switch (event) {
                case BotEventType.messageRecieved: {
                    const msgData = data as MessageEventData;
                    const messageId = msgData.message.messageId;
                    const messageText = msgData.message.text;

                    metricsCollector.onEvent(
                        traceId,
                        botName,
                        'message',
                        'message.received',
                        { messageId, phase: 'reception' },
                        messageText
                    );
                    metricsCollector.onMessageReceived(botName, messageId);
                    break;
                }

                case BotEventType.messageProcessingStarted: {
                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'message',
                        'message.processing',
                        { phase: 'processing' }
                    );
                    break;
                }

                case BotEventType.beforeActionsExecuting: {
                    const beforeActionsData = data as BeforeActionsEventData;
                    const commands = beforeActionsData.commands;
                    const commandsList = [...commands]
                        .map((c) => c.key)
                        .join(', ');
                    metricsCollector.onEvent(
                        traceId,
                        botName,
                        'message',
                        'message.beforeActionsExecuting',
                        {
                            phase: 'processing',
                            commands: commandsList
                        }
                    );
                    break;
                }

                case BotEventType.messageProcessingFinished: {
                    const msgData = data as MessageEventData;
                    const messageId = msgData.message.messageId;

                    metricsCollector.onSpanEnd(
                        traceId,
                        'message.processing',
                        'success',
                        { phase: 'finalization' }
                    );
                    metricsCollector.onMessageProcessingFinished(
                        botName,
                        messageId,
                        traceId
                    );
                    break;
                }

                case BotEventType.commandActionExecuting: {
                    const cmdData = data as CommandEventData;
                    const actionName = cmdData.action.key;
                    const messageId = cmdData.ctx.messageInfo.id;

                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'command',
                        `command.action.${actionName}`,
                        { actionName, messageId, phase: 'command' }
                    );
                    metricsCollector.onCommandExecuting(
                        botName,
                        actionName,
                        messageId
                    );
                    break;
                }

                case BotEventType.commandActionExecuted: {
                    const cmdData = data as CommandEventData;
                    const actionName = cmdData.action.key;
                    const messageId = cmdData.ctx.messageInfo.id;

                    metricsCollector.onSpanEnd(
                        traceId,
                        `command.action.${actionName}`,
                        'success',
                        { actionName, messageId, phase: 'command' }
                    );
                    metricsCollector.onCommandExecuted(
                        botName,
                        actionName,
                        messageId
                    );
                    break;
                }

                case BotEventType.commandActionCaptureStarted: {
                    const captureData = data as CaptureEventData;
                    const parentMessageId = captureData.parentMessageId;

                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'command',
                        `command.capture.${parentMessageId}`,
                        { parentMessageId, phase: 'capture' }
                    );
                    break;
                }

                case BotEventType.commandActionCaptureAborted: {
                    const captureData = data as CaptureEventData;
                    const parentMessageId = captureData.parentMessageId;

                    metricsCollector.onSpanEnd(
                        traceId,
                        `command.capture.${parentMessageId}`,
                        'error',
                        { parentMessageId, phase: 'capture', aborted: true }
                    );
                    break;
                }

                case BotEventType.replyActionExecuting: {
                    const cmdData = data as CommandEventData;
                    const actionName = cmdData.action.key;
                    const messageId = cmdData.ctx.messageInfo.id;

                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'command',
                        `reply.action.${actionName}`,
                        { actionName, messageId, phase: 'command' }
                    );
                    metricsCollector.onCommandExecuting(
                        botName,
                        actionName,
                        messageId
                    );
                    break;
                }

                case BotEventType.replyActionExecuted: {
                    const cmdData = data as CommandEventData;
                    const actionName = cmdData.action.key;
                    const messageId = cmdData.ctx.messageInfo.id;

                    metricsCollector.onSpanEnd(
                        traceId,
                        `reply.action.${actionName}`,
                        'success',
                        { actionName, messageId, phase: 'command' }
                    );
                    metricsCollector.onCommandExecuted(
                        botName,
                        actionName,
                        messageId
                    );
                    break;
                }

                case BotEventType.inlineQueryRecieved: {
                    const inlineData = data as InlineQueryEventData;
                    const queryId = inlineData.query.queryId;

                    metricsCollector.onEvent(
                        traceId,
                        botName,
                        'inline',
                        'inline.queryReceived',
                        { queryId }
                    );
                    metricsCollector.onInlineQueryReceived(botName, queryId);
                    break;
                }

                case BotEventType.inlineActionExecuting: {
                    const inlineData = data as InlineActionEventData;
                    const actionName = inlineData.action.key;
                    const queryId = inlineData.ctx.queryText || 'unknown';

                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'inline',
                        `inline.action.${actionName}`,
                        { actionName, queryId, phase: 'inline' }
                    );
                    break;
                }

                case BotEventType.inlineActionExecuted: {
                    const inlineData = data as InlineActionEventData;
                    const actionName = inlineData.action.key;
                    const queryId = inlineData.ctx.queryText || 'unknown';

                    metricsCollector.onSpanEnd(
                        traceId,
                        `inline.action.${actionName}`,
                        'success',
                        { actionName, queryId, phase: 'inline' }
                    );
                    break;
                }

                case BotEventType.inlineProcessingAborting: {
                    const inlineData = data as EventData<
                        typeof BotEventType.inlineProcessingAborting
                    >;
                    const queryId = inlineData.abortedQuery.queryId;

                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'inline',
                        'inline.processingAbort',
                        { queryId, phase: 'abort' }
                    );
                    break;
                }

                case BotEventType.inlineProcessingAborted: {
                    const inlineData = data as InlineAbortEventData;
                    const queryId = inlineData.abortedQuery.queryId;

                    metricsCollector.onSpanEnd(
                        traceId,
                        'inline.processingAbort',
                        'error',
                        { queryId, phase: 'abort', aborted: true }
                    );
                    break;
                }

                case BotEventType.inlineProcessingFinished: {
                    // inlineProcessingFinished only has botName in the library
                    const queryId = 'completed';

                    metricsCollector.onEvent(
                        traceId,
                        botName,
                        'inline',
                        'inline.processingFinished',
                        { queryId }
                    );
                    metricsCollector.onInlineQueryFinished(
                        botName,
                        queryId,
                        traceId
                    );
                    break;
                }

                case BotEventType.scheduledActionExecuting: {
                    const schedData = data as ScheduledEventData;
                    const actionName = schedData.action.key;

                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'scheduled',
                        `scheduled.action.${actionName}`,
                        { actionName, phase: 'scheduled' }
                    );
                    metricsCollector.onScheduledActionExecuting(
                        botName,
                        actionName
                    );
                    break;
                }

                case BotEventType.scheduledActionExecuted: {
                    const schedData = data as ScheduledEventData;
                    const actionName = schedData.action.key;

                    metricsCollector.onSpanEnd(
                        traceId,
                        `scheduled.action.${actionName}`,
                        'success',
                        { actionName, phase: 'scheduled' }
                    );
                    metricsCollector.onScheduledActionExecuted(
                        botName,
                        actionName,
                        traceId
                    );
                    break;
                }

                case BotEventType.apiRequestSending: {
                    const apiData = data as ApiEventData;
                    const method = apiData.telegramMethod || 'unknown';

                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'api',
                        `api.request.${method}`,
                        { method, phase: 'response' }
                    );
                    metricsCollector.onApiRequestSending(traceId);
                    break;
                }

                case BotEventType.apiRequestSent: {
                    const apiData = data as ApiEventData;
                    const method = apiData.telegramMethod || 'unknown';

                    metricsCollector.onSpanEnd(
                        traceId,
                        `api.request.${method}`,
                        'success',
                        { method, phase: 'response' }
                    );
                    metricsCollector.onApiRequestSent(traceId);
                    break;
                }

                case BotEventType.error: {
                    const errData = data as ErrorEventData;
                    metricsCollector.onEvent(
                        traceId,
                        botName,
                        'message',
                        'error',
                        {
                            errorName: errData.error.name,
                            errorMessage: errData.error.message
                        }
                    );
                    metricsCollector.onError(
                        errData.error.message,
                        errData.error.name,
                        traceId
                    );
                    break;
                }
            }
        } catch (err) {
            console.error('Monitoring event handler error:', err);
        }
    };
}
