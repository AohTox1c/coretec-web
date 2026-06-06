# Despliegue de CORE-TEC

## Estado actual

- Entorno temporal: https://coretec-web.pages.dev
- Dominio final: https://core-tec.cl
- Hosting: Cloudflare Pages
- El cambio de nameservers del dominio final sigue pendiente.
- El sitio ya incluye robots, sitemap, canonical y metadatos sociales para el dominio final.

## Configuración de Cloudflare Pages

- Rama de producción: `master`
- Comando de build: `npm run build`
- Directorio de salida: `dist`

## Activación del dominio final

El sitio queda preparado para activarse sin cambios adicionales en el código. El único paso
externo pendiente es que el propietario cambie los nameservers del dominio a los indicados por
Cloudflare. Cuando la propagación termine, se debe comprobar que `https://core-tec.cl` muestre
el sitio y tenga un certificado HTTPS activo.
