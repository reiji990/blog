import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

interface ShareProps {
  title: string
  subtitle: string | undefined
  slug: string
  summary: string | undefined
}

export default function Share ({ title, subtitle, slug, summary }: ShareProps) {
  const fulltitle = subtitle ? `${title} ${subtitle}` : title
  return (
    <div className="m-4 mt-8 flex flex-col items-center justify-center pt-4 sm:flex-row">
      <div className="mb-4 sm:mb-0">
        <p className="text-highlighted dark:text-darkmode-highlighted mr-3 font-bold text-primary-500">
          share
        </p>
      </div>
      <div>
        <ul>
          <li className="inline-block">
            <SocialIcon
              kind="facebook"
              size={5}
              aria-label={'facebookshare'}
              href={`https://facebook.com/sharer/sharer.php?u=${siteMetadata.siteUrl}blog/${slug}`}
            />
          </li>
          <li className="ml-4 inline-block">
            <SocialIcon
              kind="twitter"
              size={5}
              aria-label={'twittershare'}
              href={`https://twitter.com/intent/tweet?text=${fulltitle}%20%7C%20${siteMetadata.title}%20${siteMetadata.siteUrl}blog/${slug}%20@${siteMetadata.author}`}
              // https://twitter.com/intent/tweet/?url=${siteMetadata.siteUrl}blog/${slug} &text=${title}`}
            />
          </li>
          <li className="ml-4 inline-block">
            <SocialIcon
              kind="threads"
              size={5}
              aria-label={'threadsshare'}
              href={`https://threads.net/intent/post?text=${siteMetadata.siteUrl}blog/${slug}`}
            />
          </li>
          <li className="ml-4 inline-block">
            <SocialIcon
              kind="linkedin"
              size={5}
              aria-label={'linkedinshare'}
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${siteMetadata.siteUrl}blog/${slug}&title=${title}&summary=${summary}&source=${siteMetadata.siteUrl}`}
            />
          </li>
          <li className="ml-4 inline-block">
            <SocialIcon
              kind="whatsapp"
              size={5}
              aria-label={'whatsappshare'}
              href={`https://wa.me/?text=${siteMetadata.siteUrl}blog/${slug}&text=${title}`}
            />
          </li>
          <li className="ml-4 inline-block">
            <SocialIcon
              kind="telegram"
              size={5}
              aria-label={'telegramshare'}
              href={`https://telegram.me/share/url?url=${siteMetadata.siteUrl}blog/${slug}&text=${title}`}
            />
          </li>
        </ul>
      </div>
    </div>
  )
}
