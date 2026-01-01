// Loan Service
// Business logic for loan calculations and management

import type { Person, Loan } from "../types"

export class LoanService {
  /**
   * Calculate total balance for a person
   * Positive = they owe us (we lent to them)
   * Negative = we owe them (they lent to us)
   */
  static calculatePersonBalance(personId: string, loans: Loan[]): number {
    const personLoans = loans.filter((loan) => loan.personId === personId)
    return Math.round(personLoans.reduce((sum, loan) => sum + loan.amount, 0))
  }

  /**
   * Get loan summary for a person
   */
  static getPersonLoanSummary(
    person: Person,
    loans: Loan[]
  ): {
    personId: string
    personName: string
    totalBalance: number // Positive = they owe us, Negative = we owe them
    totalLent: number // Total we lent to them
    totalBorrowed: number // Total they lent to us
    transactions: Loan[]
  } {
    const personLoans = loans.filter((loan) => loan.personId === person.id)
    const totalBalance = Math.round(personLoans.reduce((sum, loan) => sum + loan.amount, 0))
    const totalLent = Math.round(
      personLoans.filter((l) => l.transactionType === "lend").reduce((sum, l) => sum + Math.abs(l.amount), 0)
    )
    const totalBorrowed = Math.round(
      personLoans.filter((l) => l.transactionType === "borrow").reduce((sum, l) => sum + Math.abs(l.amount), 0)
    )

    return {
      personId: person.id,
      personName: person.name,
      totalBalance,
      totalLent,
      totalBorrowed,
      transactions: personLoans.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)),
    }
  }

  /**
   * Get all loan summaries
   */
  static getAllLoanSummaries(
    people: Person[],
    loans: Loan[]
  ): Array<{
    personId: string
    personName: string
    totalBalance: number
    totalLent: number
    totalBorrowed: number
    transactions: Loan[]
  }> {
    return people
      .filter((p) => p.isActive)
      .map((person) => this.getPersonLoanSummary(person, loans))
      .filter((summary) => summary.transactions.length > 0)
  }

  /**
   * Calculate total balance across all people
   * Positive = net amount others owe us
   * Negative = net amount we owe others
   */
  static calculateTotalBalance(loans: Loan[]): number {
    return Math.round(loans.reduce((sum, loan) => sum + loan.amount, 0))
  }

  /**
   * Get total lent (money we lent to others)
   */
  static getTotalLent(loans: Loan[]): number {
    return Math.round(
      loans.filter((l) => l.transactionType === "lend").reduce((sum, l) => sum + Math.abs(l.amount), 0)
    )
  }

  /**
   * Get total borrowed (money others lent to us)
   */
  static getTotalBorrowed(loans: Loan[]): number {
    return Math.round(
      loans.filter((l) => l.transactionType === "borrow").reduce((sum, l) => sum + Math.abs(l.amount), 0)
    )
  }
}

