import { cn } from '@/lib/utils'

export default function SectionHeading({ eyebrow, title, subtitle, className, align = 'left' }) {
  return (
    <div className={cn('space-y-4 mb-14', align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8] font-medium">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#94A3B8] text-base md:text-lg leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
