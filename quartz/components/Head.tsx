import { i18n } from "../i18n"
import { FullSlug, joinSegments, pathToRoot, simplifySlug } from "../util/path"
import { JSResourceToScriptElement } from "../util/resources"
import { googleFontHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const Head: QuartzComponent = ({ cfg, fileData, externalResources }: QuartzComponentProps) => {
    const frontmatterTitle = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
    const siteTitle = cfg.pageTitle ?? frontmatterTitle
    const title = fileData.slug === "index" ? siteTitle : `${frontmatterTitle} — ${siteTitle}`
    const description =
      fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description
    const { css, js } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)

    const iconPath = joinSegments(baseDir, "static/icon.png")
    const ogImagePath = `https://${cfg.baseUrl}/static/og-image.png`

    const simpleSlug = simplifySlug(fileData.slug!)
    const canonicalUrl = `https://${cfg.baseUrl}/${simpleSlug === "/" ? "" : simpleSlug}`
    const isPost = fileData.slug?.startsWith("Posts/") ?? false
    const ogType = isPost ? "article" : "website"

    const jsonLd = isPost
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: frontmatterTitle,
          description,
          url: canonicalUrl,
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          image: ogImagePath,
          datePublished: fileData.dates?.created.toISOString(),
          dateModified: fileData.dates?.modified.toISOString(),
          author: {
            "@type": "Person",
            name: "Athreya Chandramouli",
            url: `https://${cfg.baseUrl}/about`,
          },
        }
      : null

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
          </>
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content={siteTitle} />
        {cfg.baseUrl && <meta property="og:image" content={ogImagePath} />}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="675" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {cfg.baseUrl && <meta name="twitter:image" content={ogImagePath} />}
        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        {css.map((href) => (
          <link key={href} href={href} rel="stylesheet" type="text/css" spa-preserve />
        ))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
