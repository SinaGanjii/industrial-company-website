"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Package, TreePine, ArrowLeft, CheckCircle } from "lucide-react"
import { Header } from "@/components/header"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6">
            محصولات ما
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            تولیدات با کیفیت و استاندارد برای پروژه‌های ساختمانی شما
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 lg:py-28">
        <div className="container mx-auto px-4 space-y-20 md:space-y-28">
          {/* Concrete Joists */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="group">
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/concrete-joist-industrial.jpg"
                  alt="تیرچه بتنی"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-5 md:space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">تیرچه بتنی</h2>
              </div>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                تیرچه‌های بتنی پیش‌ساخته ما با استفاده از بهترین مواد اولیه و تکنولوژی روز تولید می‌شوند. این محصولات برای
                استفاده در سقف‌های تیرچه و بلوک طراحی شده‌اند و دارای مقاومت بالا و عمر طولانی هستند.
              </p>
              <ul className="space-y-3">
                {[
                  "تولید با استاندارد ملی ایران",
                  "مقاومت بالا در برابر بارهای سنگین",
                  "ابعاد و طول‌های متنوع",
                  "نصب آسان و سریع",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact">
                <Button size="lg" className="gap-2 mt-2 hover:gap-3 transition-all">
                  درخواست قیمت
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Concrete Blocks */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-5 md:space-y-6 order-2 lg:order-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">بلوک سقفی</h2>
              </div>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                بلوک‌های سقفی ما به عنوان پرکننده فضای بین تیرچه‌ها استفاده می‌شوند. این محصولات علاوه بر کاهش وزن سقف،
                عایق حرارتی و صوتی عالی را نیز فراهم می‌کنند.
              </p>
              <ul className="space-y-3">
                {["وزن سبک و مناسب", "عایق حرارتی و صوتی", "مقاوم در برابر رطوبت", "صرفه‌جویی در هزینه‌ها"].map(
                  (item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                    </li>
                  ),
                )}
              </ul>
              <Link href="/contact">
                <Button size="lg" className="gap-2 mt-2 hover:gap-3 transition-all">
                  درخواست قیمت
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2 group">
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/concrete-blocks-ceiling.jpg"
                  alt="بلوک سقفی"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Garden Walls */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="group">
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/decorative-garden-wall-concrete.jpg"
                  alt="دیوار باغچه‌ای"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-5 md:space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <TreePine className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">دیوار باغچه‌ای</h2>
              </div>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                دیوارهای تزئینی باغچه‌ای ما برای زیباسازی فضای سبز و محوطه‌سازی طراحی شده‌اند. این محصولات با طراحی‌های
                متنوع و کیفیت بالا، زیبایی و دوام را به فضای شما می‌آورند.
              </p>
              <ul className="space-y-3">
                {["طراحی‌های متنوع و زیبا", "مقاوم در برابر شرایط جوی", "نصب آسان", "رنگ‌ها و بافت‌های مختلف"].map(
                  (item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                    </li>
                  ),
                )}
              </ul>
              <Link href="/contact">
                <Button size="lg" className="gap-2 mt-2 hover:gap-3 transition-all">
                  درخواست قیمت
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            نیاز به مشاوره دارید؟
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto">
            کارشناسان ما آماده پاسخگویی به سوالات شما هستند
          </p>
          <Link href="/contact">
            <Button size="lg" className="text-base md:text-lg px-8 py-6">
              تماس با ما
            </Button>
          </Link>
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
