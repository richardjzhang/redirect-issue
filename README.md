## Context

The current system handles a variety of paths, some of which require redirection with a trailing slash, while others do not. This distinction required for their gradual migration of legacy pages to their new pages.

To add more color, the presence of trailing slashes in the paths is beyond their control. As part of the migration process, the system needs to accommodate paths with or without trailing slashes.

This repository is a sample of an example flow that they may face in their actual codebase. I've provided a flow diagram illustrating the preferred redirects in this sample repository under the section **Ideal redirect flow**: [Redirect Issue Diagram](https://whimsical.com/akqa-middleware-query-S35FHnwmXetnnpG3XwMswa).

## Edge Middleware Redirect issue

This repository contains code that describes a potential redirect issue observed when they're using Edge Middleware. The issue is associated with the interaction of two specific middleware flags: `skipMiddlewareUrlNormalize` and `skipTrailingSlashRedirect`.

A flow diagram illustrating the impact of these flags on path redirection can be found here: [Redirect Issue Diagram](https://whimsical.com/akqa-middleware-query-S35FHnwmXetnnpG3XwMswa).

In summary, the issue appears under a specific configuration of the middleware flags. When both `skipMiddlewareUrlNormalize` and `skipTrailingSlashRedirect` are set to `true`, the redirects operate as expected.

## Implications of Setting Both Flags to true

If the solution to is to set both `skipMiddlewareUrlNormalize` and `skipTrailingSlashRedirect` to `true` to prevent the infinite redirect loop, we'd like to understand the potential implications of this configuration.

In particular, are there any implications around setting `skipMIddlewareUrlNormalize` to `true`, given that it disables URL normalization.
