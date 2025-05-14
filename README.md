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
PORT=3000                  # Puerto del servidor
```

| Variable              | Requerido | Ejemplo                      |
| --------------------- | --------- | ---------------------------- |
| PAGE_SEMINUEVOS       | Sí        | https://www.seminuevos.com   |
| PAGE_SEMINUEVOS_LOGIN | Sí        | https://admin.seminuevos.com |
| EMAIL_SEMINUEVOS      | Sí        | usuario@dominio.com          |
| PASSWORD_SEMINUEVOS   | Sí        | ****\*\*\*\*****             |
| DEFAULT_TIMEOUT       | No        | 30000                        |
| NAVIGATION_TIMEOUT    | No        | 60000                        |
| PORT                  | No        | 3000                         |

## Documentación API 📚
### Endpoints disponibles en http://localhost:3000/api-docs

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
curl -X POST http://localhost:3000/api/publish \
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


## Seguridad ⚠️
**<span style="color:red">Nunca compartir archivo `.env`</span>**

Usar variables seguras en producción

Actualizar dependencias regularmente

---

### ✉️ Contacto: eduardo.leal.or@gmail.com
### 🔧 Mantenido por: Eduardo Leal