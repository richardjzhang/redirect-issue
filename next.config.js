const {
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
} = require('next/constants')

// const domainLocales = JSON.parse(process.env.DOMAIN_LOCALES || '[]')

// const locales = {
//   auDesktop: 'en-AU',
//   auMobile: 'AU',
//   nzDesktop: 'en-NZ',
//   nzMobile: 'NZ',
//   intDesktop: 'en-US',
//   intMobile: 'US',
// }

const moduleExports = (phase) => {
  const isProductionPhase =
    phase === PHASE_PRODUCTION_BUILD || phase === PHASE_PRODUCTION_SERVER

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    compiler: {
      ...(isProductionPhase && {
        reactRemoveProperties: true,
      }),
    },
    images: {
      domains: ['localhost', 'via.placeholder.com'],
    },
    reactStrictMode: true,
    swcMinify: true,
    skipTrailingSlashRedirect: true,
    //skipMiddlewareUrlNormalize: true,
    // },
    webpack: (config) => {
      // Grab the existing rule that handles SVG imports
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.('.svg'),
      )

      config.module.rules.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url
        },
        // Use asset/source for all other svg imports
        {
          test: /\.svg$/i,
          resourceQuery: { not: /url/ }, // exclude if *.svg?url
          type: 'asset/source',
        },
      )

      // Modify the file loader rule to ignore *.svg, since we have it handled now.
      fileLoaderRule.exclude = /\.svg$/i

      return config
    },
  }

  return nextConfig
}

module.exports = (phase, options) => moduleExports(phase, options)
