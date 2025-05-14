# API para publicar anuncios en SemiNuevos.com

## Requisitos

- Node.js
- npm

## Instalación

1. Clonar el repositorio.
2. Ejecutar `npm install` para instalar las dependencias.
3. Ejecutar `npm run start` para iniciar el servidor.

## Endpoints

### POST /api/publish

Publica un anuncio en SemiNuevos.com.

#### Body
```json
{
  "price": "200000",
  "description": "Excelente estado, único dueño"
}
