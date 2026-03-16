import Link from "next/link"

import { Button } from "@/components/ui/button"

function FlowerGraphic() {
  return (
    <svg
      viewBox="0 0 320 320"
      aria-hidden="true"
      className="h-full w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.42">
        <path
          d="M56 286C84 238 106 194 122 155C138 116 145 85 143 54"
          stroke="#F3EEE4"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path d="M122 156C102 149 82 148 60 154" stroke="#F3EEE4" strokeWidth="4" strokeLinecap="round" />
        <path d="M136 114C118 108 100 108 82 114" stroke="#F3EEE4" strokeWidth="4" strokeLinecap="round" />
        <path d="M150 76C132 70 114 70 98 78" stroke="#F3EEE4" strokeWidth="4" strokeLinecap="round" />
        <g fill="#F3EEE4">
          <g transform="translate(132 148)">
            <ellipse rx="18" ry="36" transform="rotate(-14)" />
            <ellipse rx="18" ry="36" transform="rotate(28)" />
            <ellipse rx="16" ry="30" transform="rotate(78)" />
            <ellipse rx="15" ry="28" transform="rotate(132)" />
            <circle r="13" fill="#D8CCB7" />
          </g>
          <g transform="translate(148 106) scale(0.9)">
            <ellipse rx="18" ry="36" transform="rotate(-12)" />
            <ellipse rx="18" ry="36" transform="rotate(32)" />
            <ellipse rx="16" ry="30" transform="rotate(86)" />
            <ellipse rx="15" ry="28" transform="rotate(138)" />
            <circle r="13" fill="#D8CCB7" />
          </g>
          <g transform="translate(166 66) scale(0.8)">
            <ellipse rx="18" ry="36" transform="rotate(-16)" />
            <ellipse rx="18" ry="36" transform="rotate(24)" />
            <ellipse rx="16" ry="30" transform="rotate(76)" />
            <ellipse rx="15" ry="28" transform="rotate(128)" />
            <circle r="13" fill="#D8CCB7" />
          </g>
          <g transform="translate(92 186) scale(0.82)">
            <ellipse rx="18" ry="36" transform="rotate(-18)" />
            <ellipse rx="18" ry="36" transform="rotate(20)" />
            <ellipse rx="16" ry="30" transform="rotate(82)" />
            <ellipse rx="15" ry="28" transform="rotate(138)" />
            <circle r="13" fill="#D8CCB7" />
          </g>
        </g>
      </g>
    </svg>
  )
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[64svh] items-center justify-center py-20 md:py-24 lg:py-28">
      <div className="page-frame relative">
        <div className="fade-in-section mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="section-kicker text-primary/72">Kenzen Energy</p>
          <h1 className="mt-6 max-w-3xl font-serif text-[3.25rem] leading-[1.2] tracking-[-0.04em] text-foreground">
            Understand your electricity bill
            <br />
            and uncover hidden energy savings.
          </h1>
          <p className="mt-7 max-w-2xl text-[1.125rem] leading-[1.28] text-muted-foreground">
            Upload your utility bill and see where your laundromat may be wasting money.
          </p>
          <p className="mt-4 max-w-2xl text-[1.125rem] leading-[1.28] text-primary/82">
            Many laundromats waste $100-$400 per month in electricity costs without realizing it.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="#upload">
              <Button size="lg" className="min-w-48">
                Analyze My Bill
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="ghost"
                className="min-w-48 border border-white/14 bg-white/6 text-foreground hover:bg-white/10"
              >
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-10 left-0 hidden h-56 w-56 opacity-28 md:block lg:h-72 lg:w-72">
          <FlowerGraphic />
        </div>
      </div>
    </section>
  )
}
