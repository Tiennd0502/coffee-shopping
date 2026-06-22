import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Quote } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { EMPTY_IMAGE } from '@/constants/images'
import { MENU, MENU_DISABLED_HINT } from '@/constants/nav'
import { shopRoastDetailPath } from '@/constants/routes'
import { fetchProducts } from '@/services/product'
import { PRODUCT_STATUS } from '@/types/product'
import { formatPrice } from '@/utils/common'
import { mapProductToRoastCollection } from '@/utils/product'
import { cn } from '@/utils/styles'

export const metadata: Metadata = {
  title: 'CoffeeHub | The Sensory Experience',
  description:
    'Precision-roasted beans for the deep-work state. Artisanal roasting meets modern tech culture.',
}

const IMG = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPPmKkkjtFk1zjJtYFiW3ZrtYvEJvoEvUKAHSByCs3dWjf3HjxktwVvo3w7Lzawswhf6NRjqWQI5BvAwTQDRZpCdtyyTlpBRzp_7OHl7iAzaS5kuZj1ZRlZI_tjL40Rb2QL-k_25Kde1ifNBXSGzWrS69IurLVwJVg-SH3DrlIu0Hc-WlUMj9AWfsn_EanAqgrUoYhJwCJ0pucb2CF00qJU9FmRaQYElk4Ftg9DpDwMqCqbCsYaPHgQLMJUpM4PsKudI4uJ95v29k',
  story:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC9BDorexBYA8NL7arwKVgIe6Erq7863s7kHw1OMVCACVohIAC8eQKe3dK7qlEa92XFVctjjGmH5Xzwb1rWEq1Z7DtT-GjiRC0MvNZ6dSJtf9yIcW0qWUFIZw7nq0i4goi3s1jvnvYiux10KBjskWvqhrsh76Fjtp_wsbS3j1gNLqToV2xDvNoyz8iBpIJu7ycoAQTLjWaoJKD-beeKEE4wgaCv3I2XRlf9AOhgshvbgz1C1FeBpZ31ziP-dzutNDgXMHqmXFyhY3M',
  t1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg5tdL-DK7JKGrryu9-xIOfMwwJV6e9m7-G_99IDpR-D3tJTMapKcXTNIzkGvDkZmdMYv7ez0ynxDsHmDYVTi40pRR_E7ozYP5nbEVdC4sybvuuRcrZ8SueBCUMlLoGCrFCGO1ydKGWkaKpMeHWyrEWAQy29Zljf2DFTycXTeXqVGtRiE657MoavU3tUOoJdcLXm5hKieHXXefyqzsHrLTzosxsAwy5MIGffXrZmzDbOMDeffFzn1U1153l-YUqTeq-cIUonWTKFE',
  t2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfpsH3-PGwI8gdT6PlE0kvU9htOZf97STml1JeLtrWM-5GNBHbucIVAvVZgeZQSN-2AWnr1_DTYRkqFdLZesg226gvO8YwVW1CS_Yx4NOatQ6CA6polVK3RmGJLMPhBgUUn3nfF5lcp7j6mLZBfekir0eGMHQBPTTE4l3t24XoPx7qA5nsPoevH2iBBMwDluQz4xQ6VXD40syyCjyKblS9tv-8JQp9sFNA_y8Jn7VlmFUsyBtCPqKkTtrKYZFXoHDoPkdgtzRYyw0',
  t3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZbZNh5eXISI4BZaWbFKEDExHTju33qCmgaOl01NK_trXOTdPepeHp6rjAfAuWVsX8qgXpTfyK4nyBRZB8Xyk0cB-58F2WI_oM0nHqKE6H9PaliES9Q3dlJ5EtW_eUBdLPoZBMvKCZBJ-q_qQQN3tpcRiesQ9SVguwpt-x6I3lP4diOpvF-lUdrnYB00gmwaSC3-3i9jnUD7q62Kbig1707xfrIaGSxM5SoaMVbe4B7Tt-rmeXGIdzRcZXqh-OUNc6xNJ8URmZZS8',
} as const

const TESTIMONIALS = [
  {
    quote:
      'The Syntax Error roast has become a fundamental part of my morning deploy. It’s the smoothest kickstart I’ve found.',
    name: 'Alex Rivero',
    role: 'Full Stack Developer',
    src: IMG.t1,
    elevated: false,
  },
  {
    quote:
      'CoffeeHub isn’t just coffee; it’s an editorial experience. The packaging, the roast, the taste—it’s pure luxury.',
    name: 'Sarah Chen',
    role: 'Creative Director',
    src: IMG.t2,
    elevated: true,
  },
  {
    quote:
      'The subscription service is flawless. I never run out of beans, and the curated variety keeps my senses sharp.',
    name: 'Marcus Thorne',
    role: 'Systems Architect',
    src: IMG.t3,
    elevated: false,
  },
] as const

const disabledActionClassName =
  'w-auto cursor-not-allowed rounded-full px-10 py-6 text-lg font-bold opacity-60'

const HOME_DISABLED_ACTIONS = {
  BREW_GUIDES: MENU.some(
    (item) => item.href === '/brew-guides' && item.disabled === true,
  ),
  ETHICAL_SOURCE: MENU.some(
    (item) => item.href === '/contact' && item.disabled === true,
  ),
} as const

const HomePage = async () => {
  const productsResult = await fetchProducts({
    limit: 4,
    page: 1,
    status: PRODUCT_STATUS.ACTIVE,
  })

  const curatedProducts =
    productsResult.ok === true
      ? productsResult.products.map((p) =>
          mapProductToRoastCollection(p, EMPTY_IMAGE),
        )
      : []

  return (
    <div className="bg-background text-on-background">
      <div className="pt-20 md:pt-24">
        {/* Hero */}
        <section className="relative mx-auto max-w-7xl overflow-hidden px-8 py-12 md:py-20">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            <div className="z-10 flex flex-1 flex-col space-y-8">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                The Editorial Chemist
              </span>
              <h1 className="font-headline text-5xl leading-[1.1] text-on-surface md:text-6xl lg:text-7xl">
                Fuel Your{' '}
                <span className="italic text-primary-container">Code</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-on-surface-variant">
                Precision-roasted beans designed for the deep-work state.
                Experience the chemical synergy of artisanal roasting and modern
                tech-culture.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/roasts"
                  className={cn(
                    buttonVariants({ variant: 'default', size: 'xl' }),
                    'w-auto rounded-full px-10 py-6 text-lg font-bold hover:scale-105',
                  )}
                >
                  Shop The Collection
                </Link>
                {HOME_DISABLED_ACTIONS.BREW_GUIDES ? (
                  <span
                    aria-disabled="true"
                    tabIndex={-1}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'xl' }),
                      'w-auto rounded-full border-0 bg-surface-container-highest px-10 py-6 text-lg font-bold text-primary hover:bg-surface-container-high',
                      disabledActionClassName,
                    )}
                  >
                    Brew Guides - {MENU_DISABLED_HINT}
                  </span>
                ) : (
                  <Link
                    href="/brew-guides"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'xl' }),
                      'w-auto rounded-full border-0 bg-surface-container-highest px-10 py-6 text-lg font-bold text-primary hover:bg-surface-container-high',
                    )}
                  >
                    Brew Guides
                  </Link>
                )}
              </div>
            </div>
            <div className="relative flex flex-1 justify-center lg:justify-end">
              <div className="absolute -bottom-8 -left-8 size-48 rounded-full bg-primary-container/20 blur-3xl" />
              <div
                className={cn(
                  'relative aspect-4/5 w-full max-w-md overflow-hidden rounded-xl bg-surface-container shadow-2xl',
                  'lg:translate-x-12 lg:rotate-3',
                )}
              >
                <Image
                  src={IMG.hero}
                  alt="Premium ceramic cup of black coffee on a dark wooden table with roasted beans"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 28rem"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Curated Selections */}
        <section className="bg-surface-container-low px-8 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-end gap-6 sm:mb-16 md:flex-row md:items-end">
              <div className="flex-1">
                <h2 className="mb-4 font-headline text-3xl text-on-surface md:text-4xl">
                  Curated Selections
                </h2>
                <p className="text-on-surface-variant">
                  The current roasting cycle favorites.
                </p>
              </div>
              <Link
                href="/roasts"
                className="group inline-flex items-center gap-2 font-bold text-primary transition-colors hover:text-primary/90"
              >
                View All
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {curatedProducts.length === 0 ? (
                <p className="col-span-full text-center text-on-surface-variant md:text-left">
                  {productsResult.ok === false
                    ? 'Could not load featured roasts. Try again from the shop.'
                    : 'No active roasts yet. Visit the shop to see what is in stock.'}
                </p>
              ) : (
                curatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={shopRoastDetailPath(item.id)}
                    className={cn(
                      'group flex flex-col space-y-4 text-inherit no-underline outline-none',
                      'transition-opacity hover:opacity-95',
                      'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    )}
                  >
                    <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-surface-container-low">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {Boolean(item.badgeLabel) && (
                        <span
                          className={cn(
                            'absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide',
                            'bg-surface-container-highest text-on-surface',
                          )}
                        >
                          {item.badgeLabel}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-headline text-lg text-on-surface">
                          {item.name}
                        </h3>
                        <span className="shrink-0 font-bold text-primary">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <p className="text-xs tracking-wider text-on-surface-variant uppercase">
                        {item.roastMeta}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Brand story */}
        <section className="mx-auto max-w-7xl px-8 py-24 md:py-32">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-24">
            <div className="order-2 flex-1 lg:order-1">
              <div className="relative">
                <div className="relative h-[min(600px,70vh)] w-full overflow-hidden rounded-xl">
                  <Image
                    src={IMG.story}
                    alt="Coffee smoke and steam against a dark background"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -top-10 -right-10 hidden rounded-full bg-primary p-10 shadow-xl xl:block xl:-right-12 xl:-top-12 xl:p-12">
                  <span className="font-headline text-2xl text-on-primary italic">
                    Est. 2024
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 flex-1 space-y-8 lg:order-2">
              <h2 className="font-headline text-4xl leading-tight text-on-surface md:text-5xl">
                The Science of the{' '}
                <span className="text-primary">Sensory Brew</span>
              </h2>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                At CoffeeHub, we view coffee as a chemical catalyst for
                creativity. Our process isn&apos;t just about roasting;
                it&apos;s about optimizing the molecular profile of every bean
                to ensure your cognitive flow remains uninterrupted.
              </p>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                We source exclusively from high-altitude estates where the
                soil&apos;s minerality translates into complex notes of dark
                chocolate, berry, and computational clarity.
              </p>
              <div className="pt-4 md:pt-8">
                {HOME_DISABLED_ACTIONS.ETHICAL_SOURCE ? (
                  <span
                    aria-disabled="true"
                    tabIndex={-1}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'w-auto rounded-full border-2 border-primary px-10 py-6 font-bold text-primary hover:bg-primary hover:text-on-primary',
                      disabledActionClassName,
                    )}
                  >
                    Our Ethical Source - {MENU_DISABLED_HINT}
                  </span>
                ) : (
                  <Link
                    href="/contact"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'w-auto rounded-full border-2 border-primary px-10 py-6 font-bold text-primary hover:bg-primary hover:text-on-primary',
                    )}
                  >
                    Our Ethical Source
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-surface-container px-8 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center md:mb-20">
              <span className="text-xs uppercase tracking-[0.2em] text-primary">
                The Community
              </span>
              <h2 className="mt-4 font-headline text-3xl text-on-surface md:text-4xl">
                Echoes from the Lab
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className={cn(
                    'relative rounded-xl p-10',
                    t.elevated
                      ? 'bg-surface shadow-xl lg:-translate-y-8'
                      : 'bg-surface-container-low',
                  )}
                >
                  <div className="mb-6 text-primary">
                    <Quote className="size-10 fill-current" aria-hidden />
                  </div>
                  <p className="mb-8 text-lg text-on-surface italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="size-12 shrink-0 overflow-hidden rounded-full bg-surface-container-highest">
                      <Image
                        src={t.src}
                        alt=""
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{t.name}</h4>
                      <p className="text-xs text-on-surface-variant">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
