# API para publicar anuncios en SemiNuevos.com

![Arquitectura API](https://img.shields.io/badge/arquitectura-capas-blue)
![Documentación Swagger](https://img.shields.io/badge/documentación-swagger-green)

## Características ✨

- Endpoints RESTful
- Arquitectura de proyecto estructurada
- Documentación API con Swagger
- Gestión de configuraciones por entorno
- Middleware de validación de datos
- Capa de servicio abstracta
- Manejo claro de errores

## Requerimientos de instalación ⚒️
Para instalar y ejecutar este proyecto necesitas:

- Node.js >= 18.x
- npm >= 9.x
- Acceso a internet
- Cuenta válida en SemiNuevos.com
- Editor de texto recomendado: VSCode

Asegúrate de tener Node.js y npm instalados. Puedes verificarlo con:

```bash
node -v
npm -v
```

## Instalación ⚙️

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/seminuevos-api.git

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Configuración Requerida 🛠

### Variables de Entorno 🔒

Crear archivo `.env` en la raíz del proyecto:

```bash
PAGE_SEMINUEVOS=https://www.seminuevos.com
PAGE_SEMINUEVOS_LOGIN=https://admin.seminuevos.com
EMAIL_SEMINUEVOS=tu@email.com
PASSWORD_SEMINUEVOS=tu_contraseña_secreta
```

Opcionales (valores por defecto):

```bash
DEFAULT_TIMEOUT=30000      # 30 segundos
NAVIGATION_TIMEOUT=60000   # 1 minuto
PORT=3333                  # Puerto del servidor
```

| Variable              | Requerido | Ejemplo                      |
| --------------------- | --------- | ---------------------------- |
| PAGE_SEMINUEVOS       | Sí        | https://www.seminuevos.com   |
| PAGE_SEMINUEVOS_LOGIN | Sí        | https://admin.seminuevos.com |
| EMAIL_SEMINUEVOS      | Sí        | usuario@dominio.com          |
| PASSWORD_SEMINUEVOS   | Sí        | ****\*\*\*\*****             |
| DEFAULT_TIMEOUT       | No        | 30000                        |
| NAVIGATION_TIMEOUT    | No        | 60000                        |
| PORT                  | No        | 3333                         |

## Documentación API 📚
### Endpoints disponibles en http://localhost:3333/api-docs

### Respuestas de la API

**Éxito (200):**
```json
{
  "message": "Anuncio publicado exitosamente",
  "data": {
    "message": "Ad published successfully",
    "evidence": {
      "screenshot": "data:image/png;base64,iVBORw0KGgKpJEcX",
      "description": "There is description",
      "price": 300000
    }
  }
}
```

## Ejemplo de Uso Completo 🤘🏼
```bash
curl -X POST http://localhost:3333/api/publish \
  -H "Content-Type: application/json" \
  -d '{
    "price": "50000",
    "description": "Vehículo en estado showroom"
  }'
````

- Respuesta exitosa incluirá:
  - Mensaje de confirmación en español e inglés.
  - Evidencia digital con:
    - Captura de pantalla en base64.
    - Descripción del anuncio.
    - Precio publicado.

## Contribución 👥
1. Reportar issues en GitHub
2. Clonar repositorio
3. Crear rama feature (`feat/nueva-funcionalidad`)
4. Desarrollar con tests
5. Actualizar documentación
6. Crear Pull Request

## Logs y errores 🐞
Cuando ocurre un error durante la publicación, la API almacena un archivo y procesa en su ejecución logs para facilitar la búsqueda de bugs.

### Logs y archivos de errores

- Todos los errores se registran en un archivo de log (`/app.log`) con marca de tiempo, tipo de error y detalles relevantes.
- Almacenamiento de capturas para verificar error visualmente.
- El sistema también muestra logs en la terminal con formato:
  ```
  [2024-06-01T12:34:56.789Z] [ERROR] [NavigationError] No se encontró el botón de publicar
  ```
- El registro incluye el timespan desde el inicio de la operación, facilitando la localización y análisis de errores en procesos largos.

Revisa los logs para identificar rápidamente el origen y contexto de cualquier fallo.


## Seguridad ⚠️
**<span style="color:red">Nunca compartir archivo `.env`</span>**

Usar variables seguras en producción

Actualizar dependencias regularmente

---

### ✉️ Contacto: eduardo.leal.or@gmail.com
### 🔧 Mantenido por: Eduardo Leal