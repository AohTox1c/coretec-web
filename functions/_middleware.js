export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === 'www.core-tec.cl') {
    url.hostname = 'core-tec.cl';
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
