# fileUpload
Servidor de archivos para todos los modulos.
## Objetivo
Almacenar y exponer todos los documentos subidos, exponer servicios para la busqueda los documentos almacenados.

## Archivos
**gulpfiles.js**: Archivo de configuración de gulp, la configuración incluye de la tareas de compilacion de los ts y las tareas de nodemon.

**src/config.ts**: Aquí están las configuraciones del host y puerto de servidor de los diferentes entornos de trabajo, también tiene una la configuración de pathFisica, esta configuración es para indicar el path raíz en donde se almacenarán los documentos.

Ejemplo de la configuracion:
```javascript
export default {
    "development" : // Seguridad 
    {
        "host": "http://localhost",
        "port": 4050,
        "method": "POST",
        "headers": {
            "Content-Type":  "multipart/form-data"
        },
        "pathFisica": "C:\\Users\\develop\\public"
    },
    "production": {
        "host": "189.204.141.193",
        "port": 4900,
        "method": "POST",
        "headers": {
            "Content-Type":  "multipart/form-data"
        }
    },
    
};
```
## Instalación
Para levantar el sevidor, se tiene que instalar las dependencias. Las dependencias están configuradas en el archivo package.json.
```
npm install
```
## Levantar el proyecto
Una vez instalado las dependencias y tener todas las configuraciones anteriores, levantar el proyecto.
```javascript
gulp serverDev // Entorno de desarrollo
gulp serverProd // Entorno produccion
````
## Flujo de la aplicación

**PUBLIC:** Es la carpeta public de la configuración del path fisico.

**MODULOS:** Se define automaticamente de acuerdo al idAplicacionSeguridad y el idModuloSeguridad la cual, el cliente(frontend) debe obtener a partir del usuario logeado, la aplicacion y del modulo en que está situado el usuario.

**Nivel 1:** A partir de este nivel el path final se calcula dinámicamente, de acuedo al path enviado como parámetro de la petición, tener en cuenta que el path es validado con una estrucutra del path preconfigurado en la base de datos de FileServer, en la tabla documento.modulo.

