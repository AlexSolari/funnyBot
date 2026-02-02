import { metricsCollector } from './metricsCollector';

// Event name constants from chz-telegram-bot
const BotEventType = {
    error: 'error.generic',
    messageRecieved: 'message.recieved',
    messageProcessingStarted: 'message.processingStarted',
    messageBeforeActionsExecuting: 'message.beforeActionsExecuting',
    messageProcessingFinished: 'message.processingFinished',
    commandActionExecuting: 'command.actionExecuting',
    commandActionExecuted: 'command.actionExecuted',
    commandCaptionStarted: 'command.captionStarted',
    commandActionCaptureStarted: 'command.actionCaptureStarted',
    commandActionCaptureAborted: 'command.actionCaptureAborted',
    replyActionExecuting: 'reply.actionExecuting',
    replyActionExecuted: 'reply.actionExecuted',
    inlineQueryRecieved: 'inline.queryRecieved',
    inlineActionExecuting: 'inline.actionExecuting',
    inlineActionExecuted: 'inline.actionExecuted',
    inlineProcessingAborting: 'inline.processingAborting',
    inlineProcessingAborted: 'inline.processingAborted',
    inlineProcessingFinished: 'inline.processingFinished',
    scheduledActionExecuting: 'scheduled.actionExecuting',
    scheduledActionExecuted: 'scheduled.actionExecuted',
    apiRequestSending: 'api.requestSending',
    apiRequestSent: 'api.requestSent'
} as const;

// Base event data with traceId
interface BaseEventData {
    traceId: string;
}

interface MessageEventData extends BaseEventData {
    botInfo: { id: number; first_name: string };
    message: { messageId: number; chatInfo: { id: number }; text?: string };
}

interface MessageBeforeActionsEventData extends BaseEventData {
    commands?: string[];
}

interface CommandEventData extends BaseEventData {
    action: { key: string };
    ctx: { messageInfo: { id: number }; chatInfo: { id: number } };
    state?: unknown;
}

interface InlineEventData extends BaseEventData {
    query?: { id: string };
    action?: { key: string };
    ctx?: { incomingQuery: { id: string } };
}

interface ScheduledEventData extends BaseEventData {
    action: { key: string };
    ctx: { chatInfo: { id: number } };
    state?: unknown;
}

interface ApiEventData extends BaseEventData {
    response: unknown;
    telegramMethod: string | null;
}

interface ErrorEventData extends BaseEventData {
    error: Error;
}

export function createMonitoringEventHandler(botName: string) {
    // Register the bot with metrics collector
    metricsCollector.registerBot(botName);

    return (event: string, _timestamp: number, data: unknown) => {
        try {
            const baseData = data as BaseEventData;
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

                case BotEventType.messageBeforeActionsExecuting: {
                    const beforeActionsData =
                        data as MessageBeforeActionsEventData;
                    const commandsList = Array.isArray(
                        beforeActionsData.commands
                    )
                        ? beforeActionsData.commands.join(', ')
                        : String(beforeActionsData.commands ?? 'none');
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

                case BotEventType.commandCaptionStarted: {
                    metricsCollector.onEvent(
                        traceId,
                        botName,
                        'command',
                        'command.captionStarted',
                        { phase: 'response' }
                    );
                    break;
                }

                case BotEventType.commandActionCaptureStarted: {
                    const cmdData = data as CommandEventData;
                    const actionName = cmdData.action.key;

                    metricsCollector.onSpanStart(
                        traceId,
                        botName,
                        'command',
                        `command.capture.${actionName}`,
                        { actionName, phase: 'capture' }
                    );
                    break;
                }

                case BotEventType.commandActionCaptureAborted: {
                    const cmdData = data as CommandEventData;
                    const actionName = cmdData.action.key;

                    metricsCollector.onSpanEnd(
                        traceId,
                        `command.capture.${actionName}`,
                        'error',
                        { actionName, phase: 'capture', aborted: true }
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
                    const inlineData = data as InlineEventData;
                    const queryId = inlineData.query?.id || 'unknown';

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
                    const inlineData = data as InlineEventData;
                    const actionName = inlineData.action?.key || 'unknown';
                    const queryId =
                        inlineData.ctx?.incomingQuery?.id || 'unknown';

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
                    const inlineData = data as InlineEventData;
                    const actionName = inlineData.action?.key || 'unknown';
                    const queryId =
                        inlineData.ctx?.incomingQuery?.id || 'unknown';

                    metricsCollector.onSpanEnd(
                        traceId,
                        `inline.action.${actionName}`,
                        'success',
                        { actionName, queryId, phase: 'inline' }
                    );
                    break;
                }

                case BotEventType.inlineProcessingAborting: {
                    const inlineData = data as InlineEventData;
                    const queryId = inlineData.query?.id || 'unknown';

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
                    const inlineData = data as InlineEventData;
                    const queryId = inlineData.query?.id || 'unknown';

                    metricsCollector.onSpanEnd(
                        traceId,
                        'inline.processingAbort',
                        'error',
                        { queryId, phase: 'abort', aborted: true }
                    );
                    break;
                }

                case BotEventType.inlineProcessingFinished: {
                    const inlineData = data as InlineEventData;
                    const queryId = inlineData.query?.id || 'unknown';

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
