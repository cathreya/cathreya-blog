import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const AboutLink: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  const aboutHref = baseDir === "." ? "./about" : `${baseDir}/about`
  return (
    <a class={classNames(displayClass, "about-link")} href={aboutHref}>
      About
    </a>
  )
}

AboutLink.css = `
.about-link {
  color: var(--secondary);
  background-color: transparent;
  font-size: 0.9rem;
  align-self: center;
}
.about-link:hover {
  text-decoration: underline;
}
`

export default (() => AboutLink) satisfies QuartzComponentConstructor
