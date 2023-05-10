
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from 'path-to-regexp'

// Generaly these should be part of the matcher to avoid cost
const pathsThatShouldNotBeProxiedOrResolved = ['/test/', '/_next']

export const config = {
  matcher: [
    '/((?!public|api|static|_next|.*\\..*|gen_204|trigger).*)',
    // special case for home page
    '/',
    // any assets (eg images, fonts, css, scripts, videos)
    '/productimages(.*)/:path*',
    // any assets (eg images, fonts, css, scripts, videos)
    '/shared_assets/:path*',
    // any assets (eg images, fonts, css, scripts, videos)
    '/basket/:path*',
    // any assets (eg images, fonts, css, scripts, videos)
    '/assets/:path*',
    // any assets (eg images, fonts, css, scripts, videos)
    //'/images/assetimages/:path*',
    '/images/:path*',
    // any assets (eg images, fonts, css, scripts, videos)
    '/assetimages/:path*',
    // any apis
    '/client/:path*',
    // any apis
    '/api/state/:path*',
    // dot net requests
    '/(.*\\.aspx)',
    '/(.*\\.ashx)',
    '/(.*\\.asmx)',
    '/(.*\\.html)',
  ],
}

const middlewareMatcherNonAssetPathsAllowedRequest = [
  // any apis
  '/client/:path*',
  // any apis
  '/api/state/:path*',
]

const middlewareExcludeAllExceptWebpageRequest =
'/((?!public|api|static|.*\\..*|_next|trigger).*)'


const pageMatcher = match(middlewareExcludeAllExceptWebpageRequest)
const NonAssetPathsAllowedMatcher = match(
  middlewareMatcherNonAssetPathsAllowedRequest,
)


const checkPathsStartWith = (
  request: NextRequest,
  paths: string[],
): boolean => {
  const requestedPath = request.nextUrl.pathname?.toLowerCase()

  return paths.some((path) => requestedPath.startsWith(path?.toLowerCase()))
}

const isPageRequest = (request: NextRequest): boolean => {
  const isNonAssetRequest = NonAssetPathsAllowedMatcher(
    request.nextUrl.pathname,
  ).valueOf()
  return (
    typeof pageMatcher(request.nextUrl.pathname).valueOf() === 'object' &&
    isNonAssetRequest === false
  )
}

const proxyResponse = (
  request: NextRequest,
): NextResponse => {
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`
  const url = request.nextUrl

  url.pathname = 'api/proxy'
  url.searchParams.set('path', target)

  console.log(`proxying to`, url)
  return NextResponse.rewrite(url)
}


export function middleware(
  request: NextRequest,
): Promise<NextResponse | undefined> {

  return middlewareProcessor(
    request,
    pathsThatShouldNotBeProxiedOrResolved)
}

interface ResolverResult {
  locationId?: number
  path?: string
  isRedirect?: boolean
  redirectStatus?: number
  isPage: boolean
}

const redirectPageResult = (pathname: string, shouldHaveSlash: boolean): ResolverResult => {
  const result: ResolverResult = {
    locationId: ((Math.random()+1) * 100),
    isPage: true
  }
  if (shouldHaveSlash && pathname.endsWith('/') || !shouldHaveSlash && !pathname.endsWith('/') ) {
    result.isRedirect = false
    result.redirectStatus = 200
    result.path = pathname

    return result
  }

  result.isRedirect = true
  result.redirectStatus = 302

  result.path = shouldHaveSlash
    ? `${pathname}/`
    : `${pathname.substring(0, pathname.length - 1)}`

  return result
}

const resolveUrl = (req: NextRequest): ResolverResult => {
  const pathname = req.nextUrl.pathname
  const shouldHaveSlash = pathname.indexOf('rewrite_page_with_slash') !== -1
  if (shouldHaveSlash || pathname.indexOf('rewrite_page_no_slash') !== -1) {
    return redirectPageResult(pathname, shouldHaveSlash)
  }

  return {
    isPage: false,
    path: pathname
  }
}

const middlewareProcessor = async (
  request: NextRequest,
  staticPathsThatShouldNotBeProxiedOrResolved: string[],
): Promise<NextResponse | undefined> => {
  // Paths that should not be proxied (existing site) or resolved
  if (
    checkPathsStartWith(request, staticPathsThatShouldNotBeProxiedOrResolved)
  ) {
    return
  }

  if (!isPageRequest(request)) {
    const url = request.nextUrl.pathname
    console.log(`not page`, url)
      return proxyResponse(request)
  }
  console.log(`MP: processiong ${request.nextUrl.pathname}`)

  const resolveResult = resolveUrl(request)
  if (!resolveResult.isPage) {
    console.log(`MP: resolve not found, proxying result`)
    return proxyResponse(request)
  }

  const url = request.nextUrl.clone()

  if (resolveResult.isRedirect === true) {
    if (
      resolveResult.path.indexOf('http://') === 0 ||
      resolveResult.path.indexOf('https://') === 0
    ) {
      return NextResponse.redirect(resolveResult.path)
    }
    url.pathname = resolveResult.path

    // regenerate URL, otherwise NextURL href has missing slash but pathnam is correct
    const redirectUrl = new URL(resolveResult.path, url)
    return NextResponse.redirect(redirectUrl)
  }

  url.pathname = `/product-list/${resolveResult.locationId}`

  return NextResponse.rewrite(new URL(url))
}
