// Debug flag - set to true to enable console.logs
const DEBUG_MODE = true;

// Store the original console.log
const originalConsoleLog = console.log;

// Override console.log
console.log = (...args) => {
    if (DEBUG_MODE) {
        originalConsoleLog.apply(console, args);
    }
};

// Optional: add a way to restore original logging
export const enableLogging = () => {
    console.log = originalConsoleLog;
}; 