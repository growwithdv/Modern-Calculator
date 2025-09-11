/**
 * MODERN CALCULATOR - JAVASCRIPT
 * College Project - Professional Structure
 * 
 * Features:
 * - Object-oriented design
 * - Error handling
 * - History tracking
 * - Keyboard support
 * - Precision handling
 * 
 * Author: Your Name
 * Date: 2024
 */

'use strict';

// ==========================================
// CALCULATOR CLASS - MAIN LOGIC
// ==========================================

class Calculator {
    constructor() {
        // DOM Elements
        this.display = document.getElementById('display');
        this.historyContainer = document.getElementById('history-container');
        
        // Calculator State
        this.currentInput = '';
        this.previousInput = '';
        this.operator = '';
        this.shouldResetDisplay = false;
        this.history = [];
        
        // Constants
        this.MAX_HISTORY_ITEMS = 10;
        this.MAX_DISPLAY_LENGTH = 12;
        this.PRECISION_DIGITS = 10;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize calculator
     */
    init() {
        this.updateDisplay('0');
        this.setupEventListeners();
        this.clearHistory();
        
        console.log('Calculator initialized successfully');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard support
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });

        // Prevent context menu on calculator
        document.querySelector('.calculator').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Add visual feedback for button presses
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('mousedown', () => {
                button.style.transform = 'translateY(0) scale(0.98)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = '';
            });
        });
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyPress(event) {
        const key = event.key;
        
        // Prevent default for calculator keys
        if (this.isCalculatorKey(key)) {
            event.preventDefault();
        }
        
        try {
            if (key >= '0' && key <= '9' || key === '.') {
                this.appendNumber(key);
            } else if (['+', '-', '*', '/'].includes(key)) {
                this.appendOperator(key);
            } else if (key === 'Enter' || key === '=') {
                this.calculate();
            } else if (key === 'Escape') {
                this.clearAll();
            } else if (key === 'Backspace') {
                this.backspace();
            } else if (key === 'Delete') {
                this.clearEntry();
            }
        } catch (error) {
            this.handleError('Keyboard input error', error);
        }
    }

    /**
     * Check if key is a calculator key
     * @param {string} key - Keyboard key
     * @returns {boolean}
     */
    isCalculatorKey(key) {
        const calculatorKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
                              '.', '+', '-', '*', '/', '=', 'Enter', 'Escape', 
                              'Backspace', 'Delete'];
        return calculatorKeys.includes(key);
    }

    /**
     * Update display with value
     * @param {string} value - Value to display
     */
    updateDisplay(value) {
        try {
            const displayValue = this.formatDisplayValue(value);
            this.display.value = displayValue;
            
            // Add animation effect
            this.display.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.display.style.transform = 'scale(1)';
            }, 100);
        } catch (error) {
            this.handleError('Display update error', error);
        }
    }

    /**
     * Format display value
     * @param {string} value - Raw value
     * @returns {string} - Formatted value
     */
    formatDisplayValue(value) {
        if (!value || value === '') return '0';
        
        // Handle very long numbers
        if (value.length > this.MAX_DISPLAY_LENGTH) {
            const num = parseFloat(value);
            if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
                return num.toExponential(6);
            }
            return num.toPrecision(8);
        }
        
        return value;
    }

    /**
     * Append number to current input
     * @param {string} number - Number to append
     */
    appendNumber(number) {
        try {
            if (this.shouldResetDisplay) {
                this.currentInput = '';
                this.shouldResetDisplay = false;
            }

            // Handle decimal point
            if (number === '.') {
                if (this.currentInput.includes('.')) {
                    return; // Already has decimal
                }
                if (this.currentInput === '') {
                    this.currentInput = '0';
                }
            }

            // Prevent input if too long
            if (this.currentInput.length >= this.MAX_DISPLAY_LENGTH) {
                this.showError('Number too long');
                return;
            }

            this.currentInput += number;
            this.updateDisplay(this.currentInput);
            
        } catch (error) {
            this.handleError('Number input error', error);
        }
    }

    /**
     * Append operator
     * @param {string} op - Operator to append
     */
    appendOperator(op) {
        try {
            if (this.currentInput === '' && this.previousInput === '') {
                return; // No number to operate on
            }

            if (this.previousInput !== '' && this.currentInput !== '' && this.operator !== '') {
                this.calculate();
            }

            this.operator = op;
            this.previousInput = this.currentInput || this.previousInput;
            this.currentInput = '';
            
            // Visual feedback
            this.highlightOperator(op);
            
        } catch (error) {
            this.handleError('Operator input error', error);
        }
    }

    /**
     * Highlight active operator
     * @param {string} op - Operator
     */
    highlightOperator(op) {
        // Remove previous highlights
        document.querySelectorAll('.operator').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add highlight to current operator
        const operatorMap = { '+': '+', '-': '-', '*': '×', '/': '/' };
        const operatorText = operatorMap[op] || op;
        
        document.querySelectorAll('.operator').forEach(btn => {
            if (btn.textContent === operatorText) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Perform calculation
     */
    calculate() {
        try {
            if (this.previousInput === '' || this.currentInput === '' || this.operator === '') {
                return; // Not enough data for calculation
            }

            const prev = parseFloat(this.previousInput);
            const current = parseFloat(this.currentInput);
            
            // Validate numbers
            if (isNaN(prev) || isNaN(current)) {
                throw new Error('Invalid number format');
            }

            let result = this.performOperation(prev, current, this.operator);
            
            // Handle result precision
            result = this.handlePrecision(result);
            
            // Validate result
            if (!isFinite(result)) {
                throw new Error('Result is not finite');
            }

            // Create history entry
            const calculation = `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operator)} ${this.formatNumber(this.currentInput)}`;
            this.addToHistory(calculation, this.formatNumber(result.toString()));

            // Update state
            this.currentInput = result.toString();
            this.operator = '';
            this.previousInput = '';
            this.updateDisplay(this.currentInput);
            this.shouldResetDisplay = true;
            
            // Remove operator highlight
            document.querySelectorAll('.operator').forEach(btn => {
                btn.classList.remove('active');
            });

        } catch (error) {
            this.handleError('Calculation error', error);
        }
    }

    /**
     * Perform mathematical operation
     * @param {number} prev - Previous number
     * @param {number} current - Current number
     * @param {string} operator - Operation
     * @returns {number} - Result
     */
    performOperation(prev, current, operator) {
        switch (operator) {
            case '+':
                return prev + current;
            case '-':
                return prev - current;
            case '*':
                return prev * current;
            case '/':
                if (current === 0) {
                    throw new Error('Division by zero');
                }
                return prev / current;
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }

    /**
     * Handle floating point precision
     * @param {number} number - Number to process
     * @returns {number} - Processed number
     */
    handlePrecision(number) {
        return Math.round(number * Math.pow(10, this.PRECISION_DIGITS)) / Math.pow(10, this.PRECISION_DIGITS);
    }

    /**
     * Get operator symbol for display
     * @param {string} operator - Operator
     * @returns {string} - Display symbol
     */
    getOperatorSymbol(operator) {
        const symbols = { '+': '+', '-': '-', '*': '×', '/': '÷' };
        return symbols[operator] || operator;
    }

    /**
     * Format number for display
     * @param {string} number - Number string
     * @returns {string} - Formatted number
     */
    formatNumber(number) {
        const num = parseFloat(number);
        if (isNaN(num)) return number;
        
        // Use localization if available
        try {
            return new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 8,
                useGrouping: false
            }).format(num);
        } catch {
            return number;
        }
    }

    /**
     * Clear all data
     */
    clearAll() {
        this.currentInput = '';
        this.operator = '';
        this.previousInput = '';
        this.shouldResetDisplay = false;
        this.updateDisplay('0');
        
        // Remove operator highlights
        document.querySelectorAll('.operator').forEach(btn => {
            btn.classList.remove('active');
        });
        
        console.log('Calculator cleared');
    }

    /**
     * Clear current entry
     */
    clearEntry() {
        this.currentInput = '';
        this.updateDisplay('0');
    }

    /**
     * Backspace function
     */
    backspace() {
        try {
            if (this.shouldResetDisplay) {
                this.clearAll();
                return;
            }
            
            if (this.currentInput.length > 0) {
                this.currentInput = this.currentInput.slice(0, -1);
                this.updateDisplay(this.currentInput || '0');
            }
        } catch (error) {
            this.handleError('Backspace error', error);
        }
    }

    /**
     * Add calculation to history
     * @param {string} calculation - Calculation expression
     * @param {string} result - Result value
     */
    addToHistory(calculation, result) {
        try {
            const historyItem = `${calculation} = ${result}`;
            this.history.unshift(historyItem);
            
            // Keep only recent calculations
            if (this.history.length > this.MAX_HISTORY_ITEMS) {
                this.history = this.history.slice(0, this.MAX_HISTORY_ITEMS);
            }
            
            this.updateHistoryDisplay();
            
        } catch (error) {
            this.handleError('History error', error);
        }
    }

    /**
     * Update history display
     */
    updateHistoryDisplay() {
        try {
            this.historyContainer.innerHTML = '';
            
            if (this.history.length === 0) {
                const emptyItem = document.createElement('div');
                emptyItem.className = 'history-item';
                emptyItem.textContent = 'No calculations yet';
                this.historyContainer.appendChild(emptyItem);
                return;
            }

            this.history.forEach((item, index) => {
                const historyElement = document.createElement('div');
                historyElement.className = 'history-item';
                historyElement.textContent = item;
                historyElement.style.animationDelay = `${index * 0.1}s`;
                
                // Add click to reuse functionality
                historyElement.addEventListener('click', () => {
                    this.reuseFromHistory(item);
                });
                
                this.historyContainer.appendChild(historyElement);
            });
            
        } catch (error) {
            this.handleError('History display error', error);
        }
    }

    /**
     * Reuse result from history
     * @param {string} historyItem - History item
     */
    reuseFromHistory(historyItem) {
        try {
            const result = historyItem.split(' = ')[1];
            if (result) {
                this.currentInput = result;
                this.updateDisplay(this.currentInput);
                this.shouldResetDisplay = true;
            }
        } catch (error) {
            this.handleError('History reuse error', error);
        }
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.updateDisplay('Error');
        setTimeout(() => {
            this.clearAll();
        }, 1500);
        
        console.warn('Calculator Error:', message);
    }

    /**
     * Handle errors
     * @param {string} context - Error context
     * @param {Error} error - Error object
     */
    handleError(context, error) {
        console.error(`${context}:`, error);
        
        if (error.message === 'Division by zero') {
            this.showError('Cannot divide by zero');
        } else {
            this.showError('Error occurred');
        }
    }

    /**
     * Get calculator state (for debugging)
     * @returns {Object} - Calculator state
     */
    getState() {
        return {
            currentInput: this.currentInput,
            previousInput: this.previousInput,
            operator: this.operator,
            shouldResetDisplay: this.shouldResetDisplay,
            historyCount: this.history.length
        };
    }
}

// ==========================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK EVENTS
// ==========================================

// Calculator instance
let calc;

/**
 * Global function: Append number
 * @param {string} number - Number to append
 */
function appendNumber(number) {
    if (calc) {
        calc.appendNumber(number);
    }
}

/**
 * Global function: Append operator
 * @param {string} operator - Operator to append
 */
function appendOperator(operator) {
    if (calc) {
        calc.appendOperator(operator);
    }
}

/**
 * Global function: Calculate result
 */
function calculate() {
    if (calc) {
        calc.calculate();
    }
}

/**
 * Global function: Clear all
 */
function clearAll() {
    if (calc) {
        calc.clearAll();
    }
}

/**
 * Global function: Clear entry
 */
function clearEntry() {
    if (calc) {
        calc.clearEntry();
    }
}

/**
 * Global function: Backspace
 */
function backspace() {
    if (calc) {
        calc.backspace();
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format number with commas (for future enhancement)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Check if device supports touch
 * @returns {boolean} - Touch support status
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Add haptic feedback (for mobile devices)
 */
function addHapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

/**
 * Theme switcher (for future enhancement)
 * @param {string} theme - Theme name
 */
function switchTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calculator-theme', theme);
}

/**
 * Load saved theme (for future enhancement)
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme) {
        switchTheme(savedTheme);
    }
}

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize calculator
        calc = new Calculator();
        
        // Add touch device class
        if (isTouchDevice()) {
            document.body.classList.add('touch-device');
        }
        
        // Load saved theme (future feature)
        // loadSavedTheme();
        
        // Add button click feedback
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                // Add haptic feedback on mobile
                if (isTouchDevice()) {
                    addHapticFeedback();
                }
                
                // Visual feedback
                this.classList.add('clicked');
                setTimeout(() => {
                    this.classList.remove('clicked');
                }, 150);
            });
        });
        
        // Prevent text selection on calculator
        document.querySelector('.calculator').addEventListener('selectstart', function(e) {
            e.preventDefault();
        });
        
        // Add service worker support (for future PWA features)
        if ('serviceWorker' in navigator) {
            // navigator.serviceWorker.register('/sw.js');
        }
        
        console.log('Calculator application initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
        
        // Fallback error display
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="text-align: center; color: white;">
                    <h2>Calculator Error</h2>
                    <p>Failed to load calculator. Please refresh the page.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px; border: none; border-radius: 5px; background: #007bff; color: white; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
    }
});

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

/**
 * Monitor calculator performance
 */
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Calculator loaded in ${loadTime}ms`);
            }, 0);
        });
    }
}

// Start performance monitoring
monitorPerformance();

// ==========================================
// ERROR HANDLING & DEBUGGING
// ==========================================

/**
 * Global error handler
 */
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Log error details
    const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
    };
    
    console.log('Error details:', errorInfo);
    
    // Show user-friendly error message
    if (calc) {
        calc.showError('An error occurred');
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// ==========================================
// EXPORT FOR TESTING (if needed)
// ==========================================

// For unit testing or external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Calculator };
}

// For browser console access
window.calculatorDebug = {
    getState: () => calc?.getState(),
    clearHistory: () => calc?.clearHistory(),
    version: '1.0.0'
};