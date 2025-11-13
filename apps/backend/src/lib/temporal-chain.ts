import { createHash } from 'crypto';
import { randomBytes } from 'crypto';

export interface TemporalChain {
  commitments: string[];  // Public commitments
  secrets: string[];      // Private secrets (kept by issuer)
  baseSecret: string;     // Root secret
}

export interface RevealResult {
  valid: boolean;
  message: string;
}

/**
 * Temporal Chain Generator
 * Creates forward hash chains for time-locked commitments
 */
export class TemporalChainGenerator {
  
  /**
   * Generates a temporal hash chain
   * @param periods - Number of time periods (e.g., 5 years)
   * @param baseSecret - Optional base secret (will generate if not provided)
   * @returns Chain of commitments and secrets
   */
  generateChain(periods: number, baseSecret?: string): TemporalChain {
    if (periods < 1 || periods > 20) {
      throw new Error('Periods must be between 1 and 20');
    }

    const base = baseSecret || this.generateRandomSecret();
    const secrets: string[] = [];
    const commitments: string[] = [];
    
    // Generate secrets in forward direction
    let currentSecret = base;
    for (let i = 0; i < periods; i++) {
      secrets.push(currentSecret);
      
      // Create commitment by hashing forward
      const commitment = this.createCommitment(currentSecret, i);
      commitments.push(commitment);
      
      // Generate next secret
      currentSecret = this.hash(currentSecret + i.toString());
    }
    
    return {
      commitments,
      secrets,
      baseSecret: base
    };
  }
  
  /**
   * Creates a commitment by hashing secret (epoch + 1) times
   * This ensures forward-security: can't derive future secrets from current
   */
  private createCommitment(secret: string, epoch: number): string {
    let hash = secret;
    for (let i = 0; i <= epoch; i++) {
      hash = this.hash(hash);
    }
    return hash;
  }
  
  /**
   * Verifies that a revealed secret matches its commitment
   */
  verifyReveal(secret: string, commitment: string, epoch: number): RevealResult {
    try {
      const computedCommitment = this.createCommitment(secret, epoch);
      
      if (computedCommitment === commitment) {
        return {
          valid: true,
          message: `✅ Secret verified for epoch ${epoch}`
        };
      }
      
      return {
        valid: false,
        message: `❌ Secret does not match commitment for epoch ${epoch}`
      };
    } catch (error) {
      return {
        valid: false,
        message: `❌ Verification error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }
  
  /**
   * Checks if a commitment can be revealed (deadline passed)
   */
  canReveal(deadline: Date): boolean {
    return new Date() >= deadline;
  }
  
  /**
   * Checks if commitment is expired (past grace period)
   */
  isExpired(deadline: Date, gracePeriodDays: number = 30): boolean {
    const gracePeriodEnd = new Date(deadline);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);
    return new Date() > gracePeriodEnd;
  }
  
  /**
   * SHA-256 hash utility
   */
  private hash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Generates cryptographically secure random secret
   */
  private generateRandomSecret(): string {
    return randomBytes(32).toString('hex');
  }
  
  /**
   * Calculates reveal deadline for a given epoch
   */
  calculateDeadline(issueDate: Date, epoch: number, intervalMonths: number = 12): Date {
    const deadline = new Date(issueDate);
    deadline.setMonth(deadline.getMonth() + (epoch + 1) * intervalMonths);
    return deadline;
  }
}

// Export singleton instance
export const temporalChain = new TemporalChainGenerator();
