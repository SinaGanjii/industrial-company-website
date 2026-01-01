// Validation Schemas avec Zod
// Schémas de validation pour toutes les entrées utilisateur

import { z } from "zod"

// Schema pour Product
export const productSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است").max(255, "نام محصول نباید بیشتر از 255 کاراکتر باشد"),
  dimensions: z.string().min(1, "ابعاد الزامی است").max(100, "ابعاد نباید بیشتر از 100 کاراکتر باشد"),
  material: z.string().max(100, "مواد اولیه نباید بیشتر از 100 کاراکتر باشد").optional().nullable(),
  unitPrice: z.number().min(0, "قیمت باید مثبت باشد").max(999999999999, "قیمت خیلی بزرگ است"),
})

// Helper function to convert Persian/Arabic digits to Western digits
function convertToWesternDigits(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
  const westernDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
  
  let result = str
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], "g"), westernDigits[i])
    result = result.replace(new RegExp(arabicDigits[i], "g"), westernDigits[i])
  }
  return result
}

// Schema pour Production
export const productionSchema = z.object({
  productId: z.string().uuid("شناسه محصول نامعتبر است"),
  productName: z.string().min(1, "نام محصول الزامی است"),
  quantity: z.number().int("تعداد باید عدد صحیح باشد").min(1, "تعداد باید حداقل 1 باشد"),
  date: z.string()
    .transform((val) => convertToWesternDigits(val)) // Convert Persian/Arabic digits to Western
    .pipe(z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ باید YYYY/MM/DD باشد")),
  shift: z.enum(["صبح", "عصر", "شب"], {
    errorMap: () => ({ message: "شیفت باید یکی از: صبح، عصر، شب باشد" }),
  }),
})

// Schema pour Cost
export const costSchema = z.object({
  type: z.enum(["electricity", "water", "gas", "salary", "rent", "other"], {
    errorMap: () => ({ message: "نوع هزینه نامعتبر است" }),
  }),
  typeLabel: z.string().min(1, "برچسب نوع هزینه الزامی است"),
  amount: z.number().min(0, "مبلغ باید مثبت باشد").max(999999999999, "مبلغ خیلی بزرگ است"),
  periodType: z.enum(["daily", "monthly", "yearly"], {
    errorMap: () => ({ message: "نوع دوره نامعتبر است" }),
  }),
  periodValue: z.string().min(1, "مقدار دوره الزامی است"),
  description: z.string().min(1, "شرح الزامی است").max(1000, "شرح نباید بیشتر از 1000 کاراکتر باشد"),
})

// Schema pour Sale
export const saleSchema = z.object({
  invoiceId: z.string().uuid("شناسه فاکتور نامعتبر است"), // Now required - all sales must come from invoices
  customerName: z.string().min(1, "نام مشتری الزامی است").max(255, "نام مشتری نباید بیشتر از 255 کاراکتر باشد"),
  productId: z.string().uuid("شناسه محصول نامعتبر است"),
  productName: z.string().min(1, "نام محصول الزامی است"),
  quantity: z.number().int("تعداد باید عدد صحیح باشد").min(1, "تعداد باید حداقل 1 باشد"),
  unitPrice: z.number().min(0, "قیمت واحد باید مثبت باشد"),
  totalPrice: z.number().min(0, "قیمت کل باید مثبت باشد"),
  date: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ باید YYYY/MM/DD باشد"),
})

// Schema pour InvoiceItem
export const invoiceItemSchema = z.object({
  productId: z.string().uuid("شناسه محصول نامعتبر است"),
  productName: z.string().min(1, "نام محصول الزامی است"),
  dimensions: z.string().min(1, "ابعاد الزامی است"),
  quantity: z.number().int("تعداد باید عدد صحیح باشد").min(1, "تعداد باید حداقل 1 باشد"),
  unitPrice: z.number().min(0, "قیمت واحد باید مثبت باشد"),
  total: z.number().min(0, "مجموع باید مثبت باشد"),
})

// Schema pour Invoice
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "شماره فاکتور الزامی است"),
  status: z.enum(["draft", "approved", "paid"], {
    errorMap: () => ({ message: "وضعیت فاکتور نامعتبر است" }),
  }),
  customerName: z.string().min(1, "نام مشتری الزامی است").max(255, "نام مشتری نباید بیشتر از 255 کاراکتر باشد"),
  customerInfo: z.object({
    address: z.string().max(500, "آدرس نباید بیشتر از 500 کاراکتر باشد").optional(),
    phone: z.string().max(50, "تلفن نباید بیشتر از 50 کاراکتر باشد").optional(),
    taxId: z.string().max(50, "کد اقتصادی نباید بیشتر از 50 کاراکتر باشد").optional(),
  }).optional(),
  items: z.array(invoiceItemSchema).min(1, "فاکتور باید حداقل یک آیتم داشته باشد"),
  subtotal: z.number().min(0, "جمع کل باید مثبت باشد"),
  discount: z.number().min(0, "تخفیف باید مثبت باشد").optional().nullable(),
  tax: z.number().min(0, "مالیات باید مثبت باشد").optional().nullable(),
  total: z.number().min(0, "مجموع باید مثبت باشد"),
  date: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ باید YYYY/MM/DD باشد"),
  dueDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ سررسید باید YYYY/MM/DD باشد").optional().nullable(),
  paidDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ پرداخت باید YYYY/MM/DD باشد").optional().nullable(),
  notes: z.string().max(1000, "یادداشت نباید بیشتر از 1000 کاراکتر باشد").optional().nullable(),
})

// Schema pour Login
export const loginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
})

