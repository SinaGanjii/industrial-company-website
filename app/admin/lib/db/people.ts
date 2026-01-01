// People Database Service
// Handles CRUD operations for people (creditors/debtors)

import type { Person } from "../types"
import { dbPersonToTS, tsPersonToDB } from "./utils"

const API_BASE = "/api/admin/people"

export class PeopleDB {
  /**
   * Get all people
   */
  static async getAll(): Promise<Person[]> {
    try {
      const response = await fetch(API_BASE, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[PeopleDB.getAll] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.data.map(dbPersonToTS)
    } catch (err) {
      console.error("[PeopleDB.getAll] Error fetching people:", err)
      throw err
    }
  }

  /**
   * Get person by ID
   */
  static async getById(id: string): Promise<Person> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[PeopleDB.getById] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbPersonToTS(result.data)
    } catch (err) {
      console.error("[PeopleDB.getById] Error fetching person:", err)
      throw err
    }
  }

  /**
   * Create a new person
   */
  static async create(
    person: Omit<Person, "id" | "createdAt" | "updatedAt">
  ): Promise<Person> {
    try {
      const dbPerson = tsPersonToDB(person)

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: person.name,
          phone: person.phone,
          address: person.address,
          notes: person.notes,
          isActive: person.isActive,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[PeopleDB.create] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbPersonToTS(result.data)
    } catch (err) {
      console.error("[PeopleDB.create] Error creating person:", err)
      throw err
    }
  }

  /**
   * Update a person
   */
  static async update(
    id: string,
    updates: Partial<Omit<Person, "id" | "createdAt" | "updatedAt">>
  ): Promise<Person> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[PeopleDB.update] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbPersonToTS(result.data)
    } catch (err) {
      console.error("[PeopleDB.update] Error updating person:", err)
      throw err
    }
  }

  /**
   * Delete a person
   */
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[PeopleDB.delete] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (err) {
      console.error("[PeopleDB.delete] Error deleting person:", err)
      throw err
    }
  }
}

