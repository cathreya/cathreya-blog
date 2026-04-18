import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  const aboutHref = baseDir === "." ? "./about" : `${baseDir}/about`
  return (
    <div class={classNames(displayClass, "page-title-block")}>
      <h1 class="page-title">
        <a href={baseDir}>{title}</a>
      </h1>
      <nav class="page-nav">
        <a href={aboutHref}>About</a>
        <span class="page-nav-sep">·</span>
        <a href="/static/pdf/1_page_Research_SWE_CV.pdf">Resume</a>
        <span class="page-nav-sep">·</span>
        <a href="https://www.admonymous.co/threya">Feedback</a>
      </nav>
    </div>
  )
}

PageTitle.css = `
.page-title {
  margin: 0;
}
.page-title-block .page-nav {
  margin-top: 0.35rem;
  font-size: 0.9rem;
  color: var(--gray);
}
.page-title-block .page-nav a {
  background-color: transparent;
  color: var(--secondary);
  text-decoration: none;
}
.page-title-block .page-nav a:hover {
  text-decoration: underline;
}
.page-title-block .page-nav-sep {
  margin: 0 0.35rem;
  color: var(--gray);
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
