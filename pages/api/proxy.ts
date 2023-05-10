import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export async function proxy(req: NextRequest): Promise<Response> {
  return fetch(`https://www.google.com/search?q=w` + (Math.random() * 100), {
    redirect: 'manual',
    method: req.method
  })


}



export default proxy
