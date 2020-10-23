import 'reflect-metadata';
import { createExpressServer, useContainer, Action, UnauthorizedError } from 'routing-controllers';
import { Container, ContainerInstance } from 'typedi';
import { default as config } from './config';
import { global } from 'core-js';

/**
 * @summary En este archivo van todos los metodos referentes a los almacenes en el sistema de inventarios
 * localhost:{{port}}/almacen/...
 */
import { ExcepcionRepository } from './repository/excepcion.repository';
import { ExcepcionController } from './controllers/excepcion.controller';
Container.get(ExcepcionRepository)

global.UserId = 3;
/**
 * @summary En este archivo van todos los metodos referentes a la seguridad (logins) el sistema de inventarios
 * localhost:{{port}}/seguridad/...
 */
import { SeguridadMiddleware } from './controllers/seguridad.controller';


//obtenemos el puerto del conf
const env: string = process.env.NODE_ENV || 'development';
const conf: any = (config as any)[env]; 
Container.set('ConfigGlobal', conf);


useContainer(Container);
// generamos el Express
const app = createExpressServer({
    cors: true,
    controllers: [ // Cada uno de los controlests de arriba
        ExcepcionController,
        // SeguridadController
    ],
    middlewares: [SeguridadMiddleware]
});

// si no se asigna puerto desde el servidor de aplicación
const PORT = process.env.PORT || conf.port;
app.listen(PORT);
console.log(`Running local server on http://localhost:${PORT}`);