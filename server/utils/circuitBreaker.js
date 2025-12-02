import { ExternalServiceError } from './errors.js';

const CircuitState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

export class CircuitBreaker {
  constructor(service, options = {}) {
    this.service = service;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.nextAttemptTime = Date.now();
  }

  async execute(fn, ...args) {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new ExternalServiceError(
          this.service,
          `Circuit breaker is OPEN for ${this.service}. Service temporarily unavailable.`
        );
      }
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }

    try {
      const result = await fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = CircuitState.CLOSED;
        console.log(`Circuit breaker for ${this.service} is now CLOSED`);
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      console.error(`Circuit breaker for ${this.service} returned to OPEN state`);
      return;
    }

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      console.error(`Circuit breaker for ${this.service} is now OPEN after ${this.failureCount} failures`);
    }
  }

  getState() {
    return {
      service: this.service,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.state === CircuitState.OPEN ? this.nextAttemptTime : null,
    };
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = Date.now();
  }
}

const breakers = new Map();

export function getCircuitBreaker(service, options) {
  if (!breakers.has(service)) {
    breakers.set(service, new CircuitBreaker(service, options));
  }
  return breakers.get(service);
}

export function resetAllCircuitBreakers() {
  breakers.forEach(breaker => breaker.reset());
}

export function getCircuitBreakerStates() {
  const states = {};
  breakers.forEach((breaker, service) => {
    states[service] = breaker.getState();
  });
  return states;
}
