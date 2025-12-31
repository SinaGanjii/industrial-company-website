"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react"
import { Header } from "@/components/header"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.")
    setFormData({ name: "", phone: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6">
            تماس با ما
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            ما همیشه آماده پاسخگویی به سوالات شما هستیم
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Contact Info Cards with hover effects */}
            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-all duration-300 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    تلفن تماس
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">دفتر مرکزی:</p>
                    <p className="font-semibold text-foreground">۰۲۱-۱۲۳۴۵۶۷۸</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">فروش:</p>
                    <p className="font-semibold text-foreground">۰۲۱-۸۷۶۵۴۳۲۱</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    ایمیل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">پشتیبانی:</p>
                    <p className="font-semibold text-foreground text-sm break-all">support@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">فروش:</p>
                    <p className="font-semibold text-foreground text-sm break-all">sales@example.com</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    آدرس
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    تهران، خیابان نمونه، خیابان فرعی دوم، پلاک ۱۲۳، طبقه سوم
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    ساعات کاری
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">شنبه تا چهارشنبه:</p>
                    <p className="font-semibold text-foreground">۸:۰۰ - ۱۷:۰۰</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">پنجشنبه:</p>
                    <p className="font-semibold text-foreground">۸:۰۰ - ۱۳:۰۰</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl md:text-3xl">فرم تماس</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">لطفا اطلاعات خود را وارد کنید</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">نام و نام خانوادگی *</label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="نام خود را وارد کنید"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">شماره تماس *</label>
                        <Input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">ایمیل</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">موضوع *</label>
                        <Input
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="موضوع پیام"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">پیام شما *</label>
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="پیام خود را اینجا بنویسید..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full sm:w-auto gap-2">
                      <Send className="h-4 w-4" />
                      ارسال پیام
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="mt-8 border-primary/20 overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted">
                    <img
                      src="/map-location-marker.jpg"
                      alt="موقعیت ما روی نقشه"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 md:py-12">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>© ۱۴۰۳ صنایع ساختمانی پیشرو. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  )
}
