class Logger {
  static log(message, color = 'white') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      reset: '\x1b[0m',
    };

    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  static error(message) {
    this.log(`❌ ${message}`, 'red');
  }

  static success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  static warning(message) {
    this.log(`⚠️ ${message}`, 'yellow');
  }

  static info(message) {
    this.log(`ℹ️ ${message}`, 'blue');
  }
}
