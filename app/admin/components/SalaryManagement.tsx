"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Users, Search, Download } from "lucide-react"
import type { Employee, SalaryPayment } from "../types"
import { getTodayPersianDate, formatPersianNumber, getCurrentMonthYear } from "../utils"
import { SalaryService } from "../services/SalaryService"
import { exportSalaryPayslipToPDF } from "../utils/exportUtils"

interface SalaryManagementProps {
  employees: Employee[]
  salaryPayments: SalaryPayment[]
  onAddEmployee: (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) => void
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void
  onDeleteEmployee: (id: string) => void
  onAddSalaryPayment: (payment: Omit<SalaryPayment, "id" | "createdAt">) => void
  onUpdateSalaryPayment: (id: string, updates: Partial<SalaryPayment>) => void
  onDeleteSalaryPayment: (id: string) => void
}

export function SalaryManagement({
  employees,
  salaryPayments,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddSalaryPayment,
  onUpdateSalaryPayment,
  onDeleteSalaryPayment,
}: SalaryManagementProps) {
  const { year, month } = getCurrentMonthYear()
  const today = getTodayPersianDate()
  const currentMonth = `${year}/${month}`

  // Employee form state
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [employeeFormData, setEmployeeFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })

  // Salary payment form state
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [paymentFormData, setPaymentFormData] = useState({
    month: currentMonth,
    paymentDate: today,
    dailySalary: "",
    daysWorked: "",
    amount: "",
    paymentMethod: "cash" as "cash" | "transfer" | "check",
    description: "",
  })

  // Search state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // Filter employees by search
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get active employees
  const activeEmployees = employees.filter((emp) => emp.isActive)

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeFormData.name) {
      alert("لطفاً نام کارمند را وارد کنید")
      return
    }

    onAddEmployee({
      name: employeeFormData.name,
      phone: employeeFormData.phone || undefined,
      address: employeeFormData.address || undefined,
      isActive: true,
      notes: employeeFormData.notes || undefined,
    })

    setEmployeeFormData({
      name: "",
      phone: "",
      address: "",
      notes: "",
    })
    setIsAddingEmployee(false)
  }

  const handleAddSalaryPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployeeId || !paymentFormData.dailySalary || !paymentFormData.daysWorked || !paymentFormData.paymentMethod) {
      alert("لطفاً کارمند، حقوق روزانه، تعداد روزها و نوع پرداخت را وارد کنید")
      return
    }

    const employee = employees.find((e) => e.id === selectedEmployeeId)
    if (!employee) {
      alert("کارمند یافت نشد")
      return
    }

    // Calculate amount automatically
    const calculatedAmount = Math.round(
      Number.parseFloat(paymentFormData.dailySalary) * Number.parseInt(paymentFormData.daysWorked, 10)
    )

    onAddSalaryPayment({
      employeeId: selectedEmployeeId,
      employeeName: employee.name,
      month: paymentFormData.month,
      paymentDate: paymentFormData.paymentDate,
      dailySalary: Math.round(Number.parseFloat(paymentFormData.dailySalary)),
      amount: calculatedAmount,
      daysWorked: Number.parseInt(paymentFormData.daysWorked, 10),
      paymentMethod: paymentFormData.paymentMethod || "cash",
      description: paymentFormData.description || undefined,
    })

    setPaymentFormData({
      month: currentMonth,
      paymentDate: today,
      dailySalary: "",
      daysWorked: "",
      amount: "",
      paymentMethod: "cash",
      description: "",
    })
    setSelectedEmployeeId("")
    setIsAddingPayment(false)
  }

  const handleDeleteEmployee = (id: string) => {
    if (confirm("آیا از حذف این کارمند اطمینان دارید؟")) {
      onDeleteEmployee(id)
    }
  }

  const handleDeleteSalaryPayment = (id: string, employeeName: string) => {
    if (confirm(`آیا از حذف حقوق ${employeeName} اطمینان دارید؟`)) {
      onDeleteSalaryPayment(id)
      alert(`حقوق ${employeeName} حذف شد`)
    }
  }

  const handleExportPayslip = async (employeeId: string, month: string) => {
    const employee = employees.find((e) => e.id === employeeId)
    if (!employee) return

    const summary = SalaryService.getSalarySummaryForMonth(employee, month, salaryPayments)
    await exportSalaryPayslipToPDF(summary)
  }

  // Calculate amount when daily salary changes
  const handleDailySalaryChange = (dailySalary: string) => {
    setPaymentFormData({ ...paymentFormData, dailySalary })
    if (dailySalary && paymentFormData.daysWorked) {
      const calculatedAmount = Math.round(
        Number.parseFloat(dailySalary) * Number.parseInt(paymentFormData.daysWorked, 10)
      )
      setPaymentFormData({ ...paymentFormData, dailySalary, amount: calculatedAmount.toString() })
    }
  }

  // Calculate amount when days worked changes
  const handleDaysWorkedChange = (daysWorked: string) => {
    setPaymentFormData({ ...paymentFormData, daysWorked })
    if (paymentFormData.dailySalary && daysWorked) {
      const calculatedAmount = Math.round(
        Number.parseFloat(paymentFormData.dailySalary) * Number.parseInt(daysWorked, 10)
      )
      setPaymentFormData({ ...paymentFormData, daysWorked, amount: calculatedAmount.toString() })
    }
  }

  // Simple handler when employee changes - recalculate amount if needed
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    // Recalculate amount if dailySalary and daysWorked are already set
    if (paymentFormData.dailySalary && paymentFormData.daysWorked) {
      const calculatedAmount = Math.round(
        Number.parseFloat(paymentFormData.dailySalary) * Number.parseInt(paymentFormData.daysWorked, 10)
      )
      setPaymentFormData({ ...paymentFormData, amount: calculatedAmount.toString() })
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Employee Form */}
      {isAddingEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>افزودن کارمند جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام کارمند *</Label>
                  <Input
                    value={employeeFormData.name}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                    placeholder="نام کارمند"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>تلفن</Label>
                  <Input
                    value={employeeFormData.phone}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
                    placeholder="تلفن"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>آدرس</Label>
                  <Input
                    value={employeeFormData.address}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, address: e.target.value })}
                    placeholder="آدرس"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>یادداشت</Label>
                  <Input
                    value={employeeFormData.notes}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, notes: e.target.value })}
                    placeholder="یادداشت"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">افزودن کارمند</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingEmployee(false)}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Salary Payment Form */}
      {isAddingPayment && (
        <Card>
          <CardHeader>
            <CardTitle>ثبت پرداخت حقوق</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSalaryPayment} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>کارمند *</Label>
                  <Select value={selectedEmployeeId} onValueChange={handleEmployeeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کارمند" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ماه (YYYY/MM) *</Label>
                  <Input
                    value={paymentFormData.month}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, month: e.target.value })}
                    placeholder="1404/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاریخ پرداخت (YYYY/MM/DD) *</Label>
                  <Input
                    value={paymentFormData.paymentDate}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                    placeholder="1404/10/15"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>حقوق روزانه (تومان) *</Label>
                  <Input
                    type="number"
                    value={paymentFormData.dailySalary}
                    onChange={(e) => handleDailySalaryChange(e.target.value)}
                    placeholder="۰"
                    required
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    برای مرجع - حقوق روزانه این پرداخت
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>تعداد روزها *</Label>
                  <Input
                    type="number"
                    value={paymentFormData.daysWorked}
                    onChange={(e) => handleDaysWorkedChange(e.target.value)}
                    placeholder="۰"
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>مبلغ کل (تومان) *</Label>
                  <Input
                    type="number"
                    value={paymentFormData.amount}
                    readOnly
                    className="bg-muted"
                    placeholder="۰"
                    required
                    min="0"
                  />
                  {paymentFormData.dailySalary && paymentFormData.daysWorked && (
                    <p className="text-xs text-muted-foreground">
                      محاسبه شده: {formatPersianNumber(
                        Math.round(
                          Number.parseFloat(paymentFormData.dailySalary) * Number.parseInt(paymentFormData.daysWorked, 10)
                        )
                      )} تومان
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>نوع پرداخت *</Label>
                  <Select
                    value={paymentFormData.paymentMethod}
                    onValueChange={(value: "cash" | "transfer" | "check") =>
                      setPaymentFormData({ ...paymentFormData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نوع پرداخت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدی</SelectItem>
                      <SelectItem value="transfer">واریز</SelectItem>
                      <SelectItem value="check">چک</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>شرح</Label>
                  <Input
                    value={paymentFormData.description}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, description: e.target.value })}
                    placeholder="شرح پرداخت"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">ثبت پرداخت</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingPayment(false)}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      {!isAddingEmployee && !isAddingPayment && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddingEmployee(true)}>
            <Plus className="h-4 w-4 mr-2" />
            افزودن کارمند
          </Button>
          <Button onClick={() => setIsAddingPayment(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            ثبت پرداخت حقوق
          </Button>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>جستجوی کارمند</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجوی کارمند..."
                  className="pr-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ماه</Label>
              <Input
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="1404/10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List with Salary Summaries */}
      <Card>
        <CardHeader>
          <CardTitle>کارمندان و حقوق ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">کارمندی یافت نشد</p>
            ) : (
              filteredEmployees.map((employee) => {
                const summary = SalaryService.getSalarySummaryForMonth(
                  employee,
                  selectedMonth,
                  salaryPayments
                )

                return (
                  <div
                    key={employee.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-purple-600" />
                          <h4 className="font-semibold text-foreground">{employee.name}</h4>
                          {!employee.isActive && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-600">
                              غیرفعال
                            </span>
                          )}
                        </div>
                        {employee.phone && (
                          <p className="text-sm text-muted-foreground">تلفن: {employee.phone}</p>
                        )}

                        {/* Salary Summary for Selected Month */}
                        {(summary.totalDaysWorked > 0 || summary.totalPaid > 0) && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                            <div className="text-sm font-semibold">خلاصه حقوق برای {selectedMonth}</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">روزهای کار:</span>
                                <span className="font-medium mr-1">{formatPersianNumber(summary.totalDaysWorked)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">حقوق مورد انتظار:</span>
                                <span className="font-medium mr-1">{formatPersianNumber(summary.expectedSalary)}</span>
                                <span className="text-xs text-muted-foreground">تومان</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">پرداخت شده:</span>
                                <span className="font-medium text-green-600 mr-1">
                                  {formatPersianNumber(summary.totalPaid)}
                                </span>
                                <span className="text-xs text-muted-foreground">تومان</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">باقیمانده:</span>
                                <span className={`font-medium mr-1 ${summary.remaining > 0 ? "text-red-600" : "text-green-600"}`}>
                                  {formatPersianNumber(summary.remaining)}
                                </span>
                                <span className="text-xs text-muted-foreground">تومان</span>
                              </div>
                            </div>
                            {summary.payments.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs font-medium mb-1">پرداخت‌ها:</div>
                                <div className="space-y-2">
                                  {summary.payments.map((payment) => {
                                    const paymentMethodLabel = 
                                      payment.paymentMethod === "cash" ? "نقدی" :
                                      payment.paymentMethod === "transfer" ? "واریز" : "چک"
                                    return (
                                      <div key={payment.id} className="flex items-center justify-between text-xs">
                                        <div className="text-muted-foreground">
                                          • {payment.paymentDate}: {formatPersianNumber(payment.amount)} تومان ({payment.daysWorked} روز - {formatPersianNumber(payment.dailySalary)} تومان/روز - {paymentMethodLabel})
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => handleDeleteSalaryPayment(payment.id, employee.name)}
                                          title="حذف این پرداخت"
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
                          onClick={() => handleExportPayslip(employee.id, selectedMonth)}
                          disabled={summary.totalDaysWorked === 0 && summary.totalPaid === 0}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          فیش حقوق
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

