import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { resolveRelative } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"
import { Date, getDate } from "./Date"
import { classNames } from "../util/lang"
import style from "./styles/postList.scss"

interface Options {
  title?: string
  limit: number
  filter: (f: QuartzPluginData) => boolean
}

const defaultOptions: Options = {
  limit: 1000,
  filter: () => true,
}

export default ((userOpts?: Partial<Options>) => {
  const PostList: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }
    const pages = allFiles.filter(opts.filter).sort(byDateAndAlphabetical(cfg)).slice(0, opts.limit)

    return (
      <div class={classNames(displayClass, "post-list")}>
        {opts.title && <h3 class="post-list-title">{opts.title}</h3>}
        <ol reversed class="post-list-ol">
          {pages.map((page) => {
            const title = page.frontmatter?.title ?? "Untitled"
            return (
              <li class="post-list-li">
                <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                  {title}
                </a>
                {page.dates && (
                  <>
                    {" "}
                    <span class="post-list-meta">
                      » <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                    </span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  PostList.css = style
  return PostList
}) satisfies QuartzComponentConstructor
