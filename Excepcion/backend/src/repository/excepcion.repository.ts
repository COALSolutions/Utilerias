import { Service} from 'typedi';
import * as Q from 'q';
import * as sql from 'mssql';
import { default as confDB } from '../data/config';
import * as http from 'http';
import { default as config } from '../config';
import { Query } from '../data/query';

/**
 * @summary En este archivo van todos los metodos referentes a los almacenes
 * 
 */

@Service()
export class ExcepcionRepository {
    
    // ************ Variables de clase ************
    private conf: any; // variabel para guardar la configuración
    query : any;

    constructor() {
        const env: string = process.env.NODE_ENV || 'development';
        this.conf = (config as any)[env]; // ejemplo de llamada al confg.js
        this.query = new Query();
    }

   // ************ Servicios GET ************

   /**
     * Plantilla de ejemplo para un servicio GET
     * @summary Objetivo del metodo 
     * @param query { nombreVarible tipoVariable descripción }   
     * @returns { nombreVarible tipoVariable descripción }
     *  
     */
    

   // ************ Servicios POST ************

    /**
     *  Plantilla de ejemplo para un servicio Post
     * @summary Objetivo del metodo 
     * @param body { nombreVarible tipoVariable descripción }   
     * @returns { nombreVarible tipoVariable descripción }
     *  
     */
    postInsExcepcion(body: any): PromiseLike<{}> {
        return this.query.spExecute(body, "[Excepcion].[INS_EXCEPCION_SP]")
    }

    // ************ Servicios PUT ************

    // ************ Servicios DELETE ************

    // ************ Metodos Privados ************
    
}
