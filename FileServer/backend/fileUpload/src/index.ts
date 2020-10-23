import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import * as express from 'express';
import { default as config } from './config';

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * localhost:{{port}}/almacen/...
 */
import { DocumentoRepository } from './repository/documento.repository';
import { DocumentoController } from './controllers/documento.controller';
Container.get(DocumentoRepository)


/**
 * @summary En este archivo van todos los metodos referentes a la seguridad (logins) el sistema 
 * localhost:{{port}}/seguridad/...
 */
// import { SeguridadRepository } from './repository/seguridad.repository';
import { SeguridadMiddleware } from './controllers/seguridad.controller';



useContainer(Container);
// generamos el Express
const app = createExpressServer({
    cors: true,
    controllers: [ // Cada uno de los controlests de arriba
        DocumentoController
    ],
    middlewares: [SeguridadMiddleware]
});

/**
 * Obtenemos la configuracion dependiendo del entorno en la que trabajamos, dentro de este json de configuracion tenemos el path fisico para aguardar los documentos. 
 */
const env: string = process.env.NODE_ENV || 'development';
const conf = (config as any)[env];
let pathFisica = conf.pathFisico;

app.use( express.static(pathFisica));

// si no se asigna puerto desde el servidor de aplicación
const PORT = process.env.PORT || conf.port;
app.listen(PORT);
console.log(`Running local server on http://localhost:${PORT}`);