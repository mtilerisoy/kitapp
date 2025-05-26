type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
}

interface LogStyle {
    color: string;
    backgroundColor?: string;
    bold?: boolean;
}

class Logger {
    private static instance: Logger;
    private readonly maxLogSize = 1000;
    private logs: LogEntry[] = [];

    private readonly styles: Record<LogLevel, LogStyle> = {
        debug: { color: '#6B7280', backgroundColor: '#F3F4F6' },  // Gray
        info: { color: '#3B82F6', backgroundColor: '#EFF6FF' },   // Blue
        success: { color: '#10B981', backgroundColor: '#ECFDF5' }, // Green
        warn: { color: '#F59E0B', backgroundColor: '#FFFBEB', bold: true },   // Orange
        error: { color: '#EF4444', backgroundColor: '#FEF2F2', bold: true }   // Red
    };

    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private getTimestamp(): string {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    }

    private formatMessage(level: LogLevel, message: string): string {
        return `%c[${this.getTimestamp()}] [${level.toUpperCase()}] ${message}`;
    }

    private getStyleString(level: LogLevel): string {
        const style = this.styles[level];
        return `
            color: ${style.color};
            background-color: ${style.backgroundColor};
            padding: 2px 4px;
            border-radius: 3px;
            ${style.bold ? 'font-weight: bold;' : ''}
        `;
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context
        };

        // Add to in-memory logs
        this.logs.push(entry);
        if (this.logs.length > this.maxLogSize) {
            this.logs.shift();
        }

        // Console output with enhanced styling
        console.log(
            this.formatMessage(level, message),
            this.getStyleString(level)
        );

        if (context) {
            console.log(
                '%cContext:',
                'color: #6B7280; font-style: italic;',
                context
            );
        }

        // For errors, we might want to send them to an error tracking service
        if (level === 'error') {
            // TODO: Implement error tracking service integration
            // e.g., Sentry, LogRocket, etc.
        }
    }

    public debug(message: string, context?: Record<string, unknown>) {
        this.log('debug', message, context);
    }

    public info(message: string, context?: Record<string, unknown>) {
        this.log('info', message, context);
    }

    public success(message: string, context?: Record<string, unknown>) {
        this.log('success', message, context);
    }

    public warn(message: string, context?: Record<string, unknown>) {
        this.log('warn', message, context);
    }

    public error(message: string, context?: Record<string, unknown>) {
        this.log('error', message, context);
    }

    public getLogs(): LogEntry[] {
        return [...this.logs];
    }
}

export const logger = Logger.getInstance(); 