import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'

export default function CTASection({
  eyebrow = 'Private Access',
  title = 'Ready to explore qualified participation?',
  primaryLabel = 'Apply for Access',
  primaryHref = '/access',
  secondaryLabel = 'Investor Portal',
  secondaryHref = SITE.investorPortal,
  secondaryExternal = true,
}) {
  return (
    <section className="section-padding bg-[#050505] border-t border-[#1E293B]">
      <div className="container-arka">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#94A3B8]">{eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-light text-white leading-tight">{title}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={primaryHref}
              className="px-8 py-4 bg-white text-[#050505] text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#D8DEE9] transition-colors duration-300 rounded"
            >
              {primaryLabel}
            </Link>
            {secondaryExternal ? (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-[#1E293B] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#0B1F3A] hover:border-[#0B1F3A] transition-all duration-300 rounded"
              >
                {secondaryLabel}
              </a>
            ) : (
              <Link
                to={secondaryHref}
                className="px-8 py-4 border border-[#1E293B] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#0B1F3A] hover:border-[#0B1F3A] transition-all duration-300 rounded"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
