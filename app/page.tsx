"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Building2,
  Package,
  TreePine,
  Phone,
  Mail,
  MapPin,
  Check,
  TrendingUp,
  Award,
  Users,
} from "lucide-react"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header variant="transparent" />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/modern-construction-site-aerial-view-steel-beams-s.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-20 text-center py-20 transition-all duration-1000 opacity-100 translate-y-0">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full">
            <span className="text-accent font-semibold text-sm md:text-base">بیش از ۲۰ سال تجربه در صنعت ساختمان</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight text-balance animate-in fade-in slide-in-from-bottom-5 duration-700">
            ساخت آینده با
            <br />
            <span className="text-accent inline-block animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-300">
              قدرت و استحکام
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-3xl mx-auto text-pretty animate-in fade-in slide-in-from-bottom-5 duration-700 delay-500">
            تولیدکننده پیشرو تیرچه، بلوک و دیوار باغچه‌ای با کیفیت استاندارد اروپا
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-5 duration-700 delay-700">
            <Link href="/products">
              <Button
                size="lg"
                className="gap-2 bg-accent hover:bg-accent/90 text-primary h-14 md:h-16 px-8 md:px-12 text-base md:text-lg w-full sm:w-auto font-semibold shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all hover:scale-105"
              >
                مشاهده محصولات
                <ArrowLeft className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="h-14 md:h-16 px-8 md:px-12 text-base md:text-lg border-2 border-white/30 text-white hover:bg-white hover:text-primary bg-transparent w-full sm:w-auto font-semibold transition-all hover:scale-105"
              >
                درخواست مشاوره رایگان
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-1000">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="h-5 w-5 text-accent" />
                <div className="text-2xl md:text-3xl font-bold text-white">ISO</div>
              </div>
              <div className="text-xs md:text-sm text-white/80">استاندارد بین‌المللی</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-5 w-5 text-accent" />
                <div className="text-2xl md:text-3xl font-bold text-white">۵۰۰+</div>
              </div>
              <div className="text-xs md:text-sm text-white/80">پروژه موفق</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div className="text-2xl md:text-3xl font-bold text-white">۲۴/۷</div>
              </div>
              <div className="text-xs md:text-sm text-white/80">پشتیبانی</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full p-1.5">
            <div className="w-1.5 h-3 bg-white rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-accent/10 rounded-full">
              <span className="text-accent font-semibold text-sm">محصولات ما</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              راهکارهای ساختمانی حرفه‌ای
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              تولیدات استاندارد و با کیفیت برای پروژه‌های ساختمانی شما
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="overflow-hidden group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="/concrete-prestressed-joist-beams-industrial-manufa.jpg"
                  alt="تیرچه بتنی"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-accent text-primary px-3 py-1 rounded-full text-sm font-bold">
                  محبوب
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                    <h3 className="text-2xl md:text-3xl font-bold">تیرچه بتنی</h3>
                  </div>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed">
                    تیرچه‌های پیش‌تنیده با ظرفیت بار بالا
                  </p>
                </div>
              </div>
              <CardContent className="p-6 bg-card">
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    <span>مقاومت بالا</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    <span>نصب آسان و سریع</span>
                  </li>
                </ul>
                <Link href="/products">
                  <Button variant="link" className="p-0 gap-2 text-accent hover:gap-4 transition-all font-semibold">
                    اطلاعات بیشتر
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="/lightweight-concrete-blocks-for-ceiling-constructi.jpg"
                  alt="بلوک سقفی"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                    <h3 className="text-2xl md:text-3xl font-bold">بلوک سقفی</h3>
                  </div>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed">بلوک‌های سبک با عایق حرارتی عالی</p>
                </div>
              </div>
              <CardContent className="p-6 bg-card">
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    <span>وزن سبک</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    <span>عایق صوتی و حرارتی</span>
                  </li>
                </ul>
                <Link href="/products">
                  <Button variant="link" className="p-0 gap-2 text-accent hover:gap-4 transition-all font-semibold">
                    اطلاعات بیشتر
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="/decorative-garden-wall-concrete-blocks-landscaping.jpg"
                  alt="دیوار باغچه‌ای"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TreePine className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                    <h3 className="text-2xl md:text-3xl font-bold">دیوار باغچه‌ای</h3>
                  </div>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed">
                    دیوارهای تزئینی با طراحی‌های متنوع
                  </p>
                </div>
              </div>
              <CardContent className="p-6 bg-card">
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    <span>طراحی زیبا</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    <span>مقاوم در برابر آب و هوا</span>
                  </li>
                </ul>
                <Link href="/products">
                  <Button variant="link" className="p-0 gap-2 text-accent hover:gap-4 transition-all font-semibold">
                    اطلاعات بیشتر
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
        <img
          src="/abstract-concrete-texture-dark-industrial-pattern.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-block mb-6 px-4 py-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full">
                <span className="text-accent font-semibold text-sm">چرا ما؟</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                شریک قابل اعتماد در پروژه‌های ساختمانی
              </h2>
              <p className="text-base md:text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                با دو دهه تجربه در صنعت ساختمان، ما متعهد به ارائه بهترین کیفیت و خدمات هستیم
              </p>
              <div className="space-y-4">
                {[
                  { icon: Award, text: "استانداردهای بین‌المللی کیفیت" },
                  { icon: TrendingUp, text: "تحویل سریع و به موقع" },
                  { icon: Phone, text: "پشتیبانی ۲۴ ساعته" },
                  { icon: Check, text: "قیمت‌گذاری رقابتی" },
                  { icon: Users, text: "مشاوره تخصصی رایگان" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group hover:translate-x-2 transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-primary-foreground text-base md:text-lg font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {[
                { value: "+۲۰", label: "سال تجربه", delay: 0 },
                { value: "+۵۰۰", label: "پروژه موفق", delay: 100 },
                { value: "+۱۰۰", label: "مشتری راضی", delay: 200 },
                { value: "۲۴/۷", label: "پشتیبانی", delay: 300 },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-primary-foreground/10 backdrop-blur-sm p-6 lg:p-8 rounded-2xl border-2 border-primary-foreground/20 hover:border-accent transition-all duration-300 hover:scale-105 ${
                    index % 2 === 1 ? "mt-8" : "-mt-0"
                  }`}
                >
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-primary-foreground/90 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />
        <img
          src="/modern-construction-site-aerial-view-steel-beams-s.jpg"
          alt="CTA Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block mb-6 px-6 py-3 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full">
            <span className="text-accent font-semibold">همین حالا شروع کنید</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance leading-tight max-w-4xl mx-auto">
            آماده شروع پروژه بعدی خود هستید؟
          </h2>
          <p className="text-base md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            با تیم متخصص ما تماس بگیرید و از مشاوره رایگان بهره‌مند شوید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="gap-2 bg-accent hover:bg-accent/90 text-primary h-14 md:h-16 px-10 md:px-12 text-base md:text-lg font-semibold shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all hover:scale-105"
              >
                تماس با ما
                <Phone className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="h-14 md:h-16 px-10 md:px-12 text-base md:text-lg border-2 border-white/30 text-white hover:bg-white hover:text-primary bg-transparent font-semibold transition-all hover:scale-105"
              >
                مشاهده محصولات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                <span className="font-bold text-base md:text-lg lg:text-xl">صنایع ساختمانی پیشرو</span>
              </div>
              <p className="text-sm md:text-base text-primary-foreground/80 leading-relaxed">
                تولیدکننده مصالح ساختمانی با کیفیت
              </p>
            </div>
            <div>
              <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4">دسترسی سریع</h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                <li>
                  <Link href="/about" className="text-primary-foreground/70 hover:text-accent transition-colors">
                    درباره ما
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-primary-foreground/70 hover:text-accent transition-colors">
                    محصولات
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-primary-foreground/70 hover:text-accent transition-colors">
                    تماس با ما
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4">محصولات</h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                <li>
                  <Link href="/products" className="text-primary-foreground/70 hover:text-accent transition-colors">
                    تیرچه بتنی
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-primary-foreground/70 hover:text-accent transition-colors">
                    بلوک سقفی
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-primary-foreground/70 hover:text-accent transition-colors">
                    دیوار باغچه‌ای
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4">تماس با ما</h4>
              <ul className="space-y-3 md:space-y-4 text-sm md:text-base">
                <li className="flex items-center gap-2 md:gap-3 text-primary-foreground/80">
                  <Phone className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                  <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3 text-primary-foreground/80">
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                  <span className="break-all">info@example.com</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 text-primary-foreground/80">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-accent mt-1 flex-shrink-0" />
                  <span>تهران، خیابان نمونه، پلاک ۱۲۳</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-6 md:pt-8 text-center">
            <p className="text-xs md:text-sm text-primary-foreground/70">
              © ۱۴۰۳ صنایع ساختمانی پیشرو. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
