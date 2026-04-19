import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({ links: {} }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
  right: [],
  afterBody: [],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
  right: [],
  afterBody: [],
}

const isPost = (f: { slug?: string }) => !!f.slug?.startsWith("Posts/")

// Custom layout specifically for the index/landing page
export const indexPageLayout: PageLayout = {
  beforeBody: [],
  left: [
    Component.PageTitle(),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.AboutMe()),
  ],
  right: [],
  afterBody: [
    Component.PostList({
      limit: 1000,
      filter: isPost,
    }),
  ],
}