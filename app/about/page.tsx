"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Award, Users, Target } from "lucide-react"
import { Header } from "@/components/header"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6">
            درباره ما
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            بیش از دو دهه تجربه در تولید مصالح ساختمانی
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="space-y-5 md:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">داستان ما</h2>
              <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p>
                  صنایع ساختمانی پیشرو با بیش از ۲۰ سال تجربه در زمینه تولید مصالح ساختمانی، یکی از پیشگامان این صنعت در
                  کشور است. ما با تکیه بر دانش فنی، تجهیزات مدرن و نیروی انسانی متخصص، محصولاتی با کیفیت بالا و
                  استاندارد ارائه می‌دهیم.
                </p>
                <p>
                  ماموریت ما ارائه بهترین محصولات ساختمانی با کیفیت برتر، قیمت مناسب و خدمات پس از فروش عالی است. ما
                  معتقدیم که کیفیت و اعتماد، پایه‌های اصلی موفقیت در این صنعت هستند.
                </p>
                <p>
                  امروزه محصولات ما در پروژه‌های بزرگ ساختمانی، مسکونی و تجاری در سراسر کشور مورد استفاده قرار می‌گیرد و
                  رضایت مشتریان ما بهترین دستاورد ماست.
                </p>
              </div>
            </div>
            <div className="aspect-video bg-muted rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/modern-construction-factory.jpg"
                alt="کارخانه تولید"
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 lg:py-28 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
            {[
              { icon: Building2, value: "۲۰+", label: "سال تجربه" },
              { icon: Award, value: "۱۵+", label: "جایزه و گواهینامه" },
              { icon: Users, value: "۵۰۰+", label: "پروژه موفق" },
              { icon: Target, value: "۱۰۰%", label: "رضایت مشتریان" },
            ].map((stat, i) => (
              <Card key={i} className="hover:shadow-xl transition-all duration-300 border-primary/20">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <stat.icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
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
