type LogLevel = "CONSOLE" | "INFO" | "WARN" | "ERROR";
type LogMeta = Record<string, unknown>;

class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  console(message: string, meta?: LogMeta) {
    this.log("CONSOLE", message, meta);
  }

  info(message: string, meta?: LogMeta) {
    this.log("INFO", message, meta);
  }

  warn(message: string, meta?: LogMeta) {
    this.log("WARN", message, meta);
  }

  error(message: string | Error, meta?: LogMeta) {
    if (message instanceof Error) {
      this.log("ERROR", message.message, { ...meta, stack: message.stack });
    } else {
      this.log("ERROR", message, meta);
    }
  }

  private log(level: LogLevel, message: string, meta?: LogMeta) {
    const timestamp = new Date().toISOString();

    if (process.env.NODE_ENV === "production") {
      const entry: Record<string, unknown> = { timestamp, level, message };
      if (meta) {
        for (const [key, value] of Object.entries(meta)) {
          entry[key] = value;
        }
      }
      console.log(JSON.stringify(entry));
      return;
    }

    let line = `[${timestamp}] ${level}: ${message}`;
    if (meta && Object.keys(meta).length > 0) {
      const { stack, ...rest } = meta;
      if (Object.keys(rest).length > 0) {
        line += ` ${JSON.stringify(rest)}`;
      }
      if (stack) {
        line += `\n  Stack: ${stack}`;
      }
    }
    console.log(line);
  }
}

export const logger = Logger.getInstance();
