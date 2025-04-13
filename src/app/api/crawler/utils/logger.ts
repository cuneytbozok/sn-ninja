import { supabase } from "../../../../lib/supabase";

export class Logger {
  private sourceType: string;

  constructor(sourceType: string) {
    this.sourceType = sourceType;
  }

  /**
   * Logs an informational message
   * @param message The message to log
   * @param sourceId Optional ID of the source being processed
   */
  async info(message: string, sourceId?: string | null): Promise<void> {
    console.log(`[INFO] [${this.sourceType}] ${message}`);
    await this.logToDatabase("info", message, sourceId);
  }

  /**
   * Logs a warning message
   * @param message The message to log
   * @param sourceId Optional ID of the source being processed
   */
  async warn(message: string, sourceId?: string | null): Promise<void> {
    console.warn(`[WARN] [${this.sourceType}] ${message}`);
    await this.logToDatabase("warn", message, sourceId);
  }

  /**
   * Logs an error message
   * @param message The message to log
   * @param sourceId Optional ID of the source being processed
   * @param error Optional error object
   */
  async error(message: string, sourceId?: string | null, error?: unknown): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] [${this.sourceType}] ${message}`, error);
    await this.logToDatabase("error", message, sourceId, errorMessage);
  }

  /**
   * Logs a message to the database
   * @param logLevel The log level
   * @param message The message to log
   * @param sourceId Optional ID of the source being processed
   * @param error Optional error message
   */
  private async logToDatabase(
    logLevel: string,
    message: string,
    sourceId?: string | null,
    error?: string
  ): Promise<void> {
    try {
      await supabase.from("crawler_logs").insert({
        source_type: this.sourceType,
        source_id: sourceId || null,
        log_level: logLevel,
        message,
        error: error || null,
      });
    } catch (dbError) {
      // If we can't log to the database, at least console log the error
      console.error("Failed to write log to database:", dbError);
    }
  }
} 