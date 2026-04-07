import Link from 'next/link'
import { withBasePath } from '@/lib/site'

type LogoProps = {
  size?: number
  className?: string
  href?: string
  showText?: boolean
}

export function Logo({
  size = 44,
  className = '',
  href = '/',
  showText = false,
}: LogoProps) {
  const icon = (
    <img
      src={withBasePath('/inri-logo.png')}
      alt="INRI CHAIN"
      width={size}
      height={size}
      className={className || 'object-contain'}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )

  if (!showText) return icon

  return (
    <Link href={href} className="flex items-center gap-3">
      {icon}
      <div className="hidden sm:block">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">
          INRI CHAIN
        </p>
        <p className="text-xs text-white/60">Proof-of-Work for everyone</p>
      </div>
    </Link>
  )
}
