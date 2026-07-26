import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import SocialIcon from '@/components/social-icons'

const Header = () => {
  let headerClass = 'flex items-center w-full justify-between py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      {/* shrink-0: サイト名は折り返させない。潰れる余地はスクロール可能なナビ側に持たせる */}
      <Link href="/" aria-label={siteMetadata.title} className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="mr-3"></div>
          {typeof siteMetadata.title === 'string' ? (
            // 高さは行高に任せる。text-2xl の行高は 32px なので h-6 (24px) を指定すると
            // 1行でも 8px はみ出し、折り返すと本文に被る
            <div className="text-2xl font-semibold whitespace-nowrap">{siteMetadata.title}</div>
          ) : (
            siteMetadata.title
          )}
        </div>
      </Link>
      {/* min-w-0: これが無いと内側の overflow-x-auto が効かず、代わりにサイト名が潰される
          ml-4: サイト名との間隔。justify-between だけだとナビが伸びた際に密着する */}
      <div className="ml-4 flex min-w-0 items-center space-x-4 leading-5 sm:space-x-6">
        {/* md: で表示。sm(640px) だと横幅が足りず "About" が見切れる
            (実測: 必要幅 631px > コンテナ幅 592px)。それ未満は MobileNav が担当する */}
        <div className="no-scrollbar hidden min-w-0 items-center space-x-4 overflow-x-auto md:flex md:space-x-6">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="hover:text-primary-500 dark:hover:text-primary-400 text-fg-strong block font-medium"
              >
                {link.title}
              </Link>
            ))}
        </div>
        <SearchButton />
        <ThemeSwitch />
        <SocialIcon kind="rss" href={`${siteMetadata.siteUrl}/feed.xml`} size={6} />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
