"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, User, Search, Download, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { Person, Loan } from "../types"
import { getTodayPersianDate, formatPersianNumber, getCurrentMonthYear } from "../utils"
import { LoanService } from "../services/LoanService"
import { exportLoanReportToPDF } from "../utils/exportUtils"

interface LoanManagementProps {
  people: Person[]
  loans: Loan[]
  onAddPerson: (person: Omit<Person, "id" | "createdAt" | "updatedAt">) => void
  onUpdatePerson: (id: string, updates: Partial<Person>) => void
  onDeletePerson: (id: string) => void
  onAddLoan: (loan: Omit<Loan, "id" | "createdAt">) => void
  onUpdateLoan: (id: string, updates: Partial<Loan>) => void
  onDeleteLoan: (id: string) => void
}

export function LoanManagement({
  people,
  loans,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
  onAddLoan,
  onUpdateLoan,
  onDeleteLoan,
}: LoanManagementProps) {
  const today = getTodayPersianDate()
  const { year, month } = getCurrentMonthYear()
  const currentMonth = `${year}/${month}`

  // Person form state
  const [isAddingPerson, setIsAddingPerson] = useState(false)
  const [personFormData, setPersonFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })

  // Loan form state
  const [isAddingLoan, setIsAddingLoan] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState("")
  const [loanFormData, setLoanFormData] = useState({
    transactionType: "lend" as "lend" | "borrow",
    amount: "",
    transactionDate: today,
    description: "",
  })

  // Search state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // Filter people by search
  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter loans by selected month
  const filteredLoans = loans.filter((loan) => {
    // Extract month from transaction date (format: YYYY/MM/DD)
    const loanMonth = loan.transactionDate.substring(0, 7) // Get YYYY/MM
    return loanMonth === selectedMonth
  })

  // Get active people
  const activePeople = people.filter((p) => p.isActive)

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault()
    if (!personFormData.name) {
      alert("لطفاً نام شخص را وارد کنید")
      return
    }

    onAddPerson({
      name: personFormData.name,
      phone: personFormData.phone || undefined,
      address: personFormData.address || undefined,
      isActive: true,
      notes: personFormData.notes || undefined,
    })

    setPersonFormData({
      name: "",
      phone: "",
      address: "",
      notes: "",
    })
    setIsAddingPerson(false)
  }

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPersonId || !loanFormData.amount) {
      alert("لطفاً شخص و مبلغ را وارد کنید")
      return
    }

    const person = people.find((p) => p.id === selectedPersonId)
    if (!person) {
      alert("شخص یافت نشد")
      return
    }

    onAddLoan({
      personId: selectedPersonId,
      personName: person.name,
      transactionType: loanFormData.transactionType,
      amount: Math.round(Number.parseFloat(loanFormData.amount)),
      transactionDate: loanFormData.transactionDate,
      description: loanFormData.description || undefined,
    })

    setLoanFormData({
      transactionType: "lend",
      amount: "",
      transactionDate: today,
      description: "",
    })
    setSelectedPersonId("")
    setIsAddingLoan(false)
  }

  const handleDeleteLoan = (id: string, personName: string) => {
    if (confirm(`آیا از حذف این تراکنش برای ${personName} اطمینان دارید؟`)) {
      onDeleteLoan(id)
      alert(`تراکنش ${personName} حذف شد`)
    }
  }

  const handleExportReport = async (personId: string) => {
    const person = people.find((p) => p.id === personId)
    if (!person) return

    // Use filtered loans for export if month is selected, otherwise all loans
    const loansToUse = selectedMonth ? filteredLoans : loans
    const summary = LoanService.getPersonLoanSummary(person, loansToUse)
    await exportLoanReportToPDF(summary)
  }

  return (
    <div className="space-y-4">
      {/* Add Person Form */}
      {isAddingPerson && (
        <Card>
          <CardHeader>
            <CardTitle>افزودن شخص جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام شخص *</Label>
                  <Input
                    value={personFormData.name}
                    onChange={(e) => setPersonFormData({ ...personFormData, name: e.target.value })}
                    placeholder="نام شخص"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>تلفن</Label>
                  <Input
                    value={personFormData.phone}
                    onChange={(e) => setPersonFormData({ ...personFormData, phone: e.target.value })}
                    placeholder="تلفن"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>آدرس</Label>
                  <Input
                    value={personFormData.address}
                    onChange={(e) => setPersonFormData({ ...personFormData, address: e.target.value })}
                    placeholder="آدرس"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>یادداشت</Label>
                  <Input
                    value={personFormData.notes}
                    onChange={(e) => setPersonFormData({ ...personFormData, notes: e.target.value })}
                    placeholder="یادداشت"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">افزودن شخص</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingPerson(false)}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Loan Form */}
      {isAddingLoan && (
        <Card>
          <CardHeader>
            <CardTitle>ثبت تراکنش مالی</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLoan} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>شخص *</Label>
                  <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب شخص" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePeople.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>نوع تراکنش *</Label>
                  <Select
                    value={loanFormData.transactionType}
                    onValueChange={(value: "lend" | "borrow") =>
                      setLoanFormData({ ...loanFormData, transactionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lend">ما به او پرداخت کردیم (قرض دادیم)</SelectItem>
                      <SelectItem value="borrow">او به ما پرداخت کرد (قرض گرفتیم)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>مبلغ (تومان) *</Label>
                  <Input
                    type="number"
                    value={loanFormData.amount}
                    onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                    placeholder="۰"
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاریخ تراکنش (YYYY/MM/DD) *</Label>
                  <Input
                    value={loanFormData.transactionDate}
                    onChange={(e) => setLoanFormData({ ...loanFormData, transactionDate: e.target.value })}
                    placeholder="1404/10/15"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>شرح</Label>
                  <Input
                    value={loanFormData.description}
                    onChange={(e) => setLoanFormData({ ...loanFormData, description: e.target.value })}
                    placeholder="شرح تراکنش"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">ثبت تراکنش</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingLoan(false)}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      {!isAddingPerson && !isAddingLoan && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddingPerson(true)}>
            <Plus className="h-4 w-4 mr-2" />
            افزودن شخص
          </Button>
          <Button onClick={() => setIsAddingLoan(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            ثبت تراکنش مالی
          </Button>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>جستجوی شخص</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجوی شخص..."
                  className="pr-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ماه (YYYY/MM)</Label>
              <Input
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="1404/10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* People List with Loan Summaries */}
      <Card>
        <CardHeader>
          <CardTitle>اشخاص و تراکنش‌های مالی ({filteredPeople.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPeople.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">شخصی یافت نشد</p>
            ) : (
              filteredPeople.map((person) => {
                // Use filtered loans if month is selected, otherwise all loans
                const loansToUse = selectedMonth ? filteredLoans : loans
                const summary = LoanService.getPersonLoanSummary(person, loansToUse)

                return (
                  <div
                    key={person.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold text-foreground">{person.name}</h4>
                          {!person.isActive && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-600">
                              غیرفعال
                            </span>
                          )}
                        </div>
                        {person.phone && (
                          <p className="text-sm text-muted-foreground">تلفن: {person.phone}</p>
                        )}

                        {/* Loan Summary */}
                        {summary.transactions.length > 0 && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                            <div className="text-sm font-semibold">خلاصه تراکنش‌ها</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">موجودی کل:</span>
                                <span
                                  className={`font-medium mr-1 ${
                                    summary.totalBalance > 0
                                      ? "text-green-600"
                                      : summary.totalBalance < 0
                                        ? "text-red-600"
                                        : ""
                                  }`}
                                >
                                  {summary.totalBalance > 0 ? (
                                    <span className="flex items-center gap-1">
                                      <ArrowUpRight className="h-3 w-3" />
                                      {formatPersianNumber(summary.totalBalance)} تومان (به ما بدهکار)
                                    </span>
                                  ) : summary.totalBalance < 0 ? (
                                    <span className="flex items-center gap-1">
                                      <ArrowDownRight className="h-3 w-3" />
                                      {formatPersianNumber(Math.abs(summary.totalBalance))} تومان (ما بدهکاریم)
                                    </span>
                                  ) : (
                                    "صفر"
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">کل قرض داده شده:</span>
                                <span className="font-medium text-green-600 mr-1">
                                  {formatPersianNumber(summary.totalLent)}
                                </span>
                                <span className="text-xs text-muted-foreground">تومان</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">کل قرض گرفته شده:</span>
                                <span className="font-medium text-red-600 mr-1">
                                  {formatPersianNumber(summary.totalBorrowed)}
                                </span>
                                <span className="text-xs text-muted-foreground">تومان</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">تعداد تراکنش:</span>
                                <span className="font-medium mr-1">
                                  {formatPersianNumber(summary.transactions.length)}
                                </span>
                              </div>
                            </div>
                            {summary.transactions.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs font-medium mb-1">تراکنش‌ها:</div>
                                <div className="space-y-2">
                                  {summary.transactions.map((loan) => {
                                    const isLend = loan.transactionType === "lend"
                                    return (
                                      <div key={loan.id} className="flex items-center justify-between text-xs">
                                        <div className="text-muted-foreground">
                                          • {loan.transactionDate}:{" "}
                                          <span className={isLend ? "text-green-600" : "text-red-600"}>
                                            {isLend ? "+" : "-"}
                                            {formatPersianNumber(Math.abs(loan.amount))} تومان
                                          </span>{" "}
                                          ({isLend ? "قرض دادیم" : "قرض گرفتیم"})
                                          {loan.description && ` - ${loan.description}`}
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => handleDeleteLoan(loan.id, person.name)}
                                          title="حذف این تراکنش"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportReport(person.id)}
                          disabled={summary.transactions.length === 0}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          گزارش PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

