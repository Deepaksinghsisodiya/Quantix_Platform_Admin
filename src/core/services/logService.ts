import axios from 'axios';

const LOG_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/logs/client`;

export type LogLevel = 'Info' | 'Warning' | 'Error' | 'Critical';

interface LogPayload {
    logLevel: LogLevel;
    message: string;
    stackTrace?: string;
    url: string;
    extraData?: string;
}

/**
 * Service to send logs to the backend for tracking and debugging.
 */
class LogService {
    private isLogging = false;

    async log(payload: Partial<LogPayload>) {
        if (this.isLogging) return; // Prevent recursive logging if log API fails
        
        this.isLogging = true;
        try {
            const fullPayload: LogPayload = {
                logLevel: payload.logLevel || 'Error',
                message: payload.message || 'Unknown Frontend Error',
                stackTrace: payload.stackTrace || new Error().stack,
                url: payload.url || window.location.href,
                extraData: payload.extraData,
            };

            // Use direct axios call to avoid interceptor loops
            await axios.post(LOG_API_URL, fullPayload, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err) {
            // If logging fails, we just print to console to avoid infinite loops
            console.error('Failed to send log to server:', err);
        } finally {
            this.isLogging = false;
        }
    }

    error(message: string, error?: any, extraData?: any) {
        this.log({
            logLevel: 'Error',
            message,
            stackTrace: error?.stack || error?.message || undefined,
            extraData: extraData ? JSON.stringify(extraData) : undefined
        });
        console.error(`[AppError] ${message}`, error);
    }

    warn(message: string, extraData?: any) {
        this.log({
            logLevel: 'Warning',
            message,
            extraData: extraData ? JSON.stringify(extraData) : undefined
        });
        console.warn(`[AppWarn] ${message}`);
    }
}

export const logService = new LogService();
