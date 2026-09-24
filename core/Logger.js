/**
 * TabSuspender HaYTooL - Layer 3: Core Layer
 * Centralized logging with timestamps and module namespaces.
 */
export class Logger {
    static prefix(moduleName) {
        return `[TabSuspender:${moduleName}]`;
    }

    static info(moduleName, ...args) {
        console.log(this.prefix(moduleName), ...args);
    }

    static warn(moduleName, ...args) {
        console.warn(this.prefix(moduleName), ...args);
    }

    static error(moduleName, ...args) {
        console.error(this.prefix(moduleName), ...args);
    }
}
