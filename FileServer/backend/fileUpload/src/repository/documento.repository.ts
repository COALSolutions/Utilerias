import { Service} from 'typedi';
import { default as config } from '../config';
import { Query } from '../data/query';
import * as fs from 'fs-extra';
import { documentoHelper } from '../helpers/documento.helper';
const jsonxml = require('jsontoxml');
import * as PATH from 'path';
import {Md5} from "md5-typescript";

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * 
 */

@Service()
export class DocumentoRepository {
    
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
     * 
     * @param query { idDocumento }
     */
    async getDocumentoById(query: any) {
        return this.query.spExecute({ idDocumento: query.idDocumento }, "[documento].[SEL_DOCUMENTO_BYID_SP]")
    }

    /**
     * Recibe un array de idDocumentos para buscar el detalle de cada documento.
     * @param query [ {idDocumento} ]
     */
    getDocumentosById(body: any): PromiseLike<{}> {
        /** Capturamos el error de conversion de documentos a json */
        try {
            let documentosSend: Array<any> = [];
            body.documentos.forEach((doc:number) => {
                documentosSend.push({ documento: {idDocumento: doc
                 } });
            });
            
            var xml = jsonxml({ documentos: documentosSend })
            return this.query.spExecute({ documentos: xml }, "[documento].[SEL_DOCUMENTOS_BYID_SP]")
        } catch (error) {
            return new Promise((resolve) => {
                resolve({ error: 'Error de formato de documentos', excepcion: error, recordsets: [] })
            });
        }
    }

    getModuloByAplicacionModulo(idAplicacionSeguridad: number, idModuloSeguridad: number){
        
            return this.query.spExecute({ idAplicacionSeguridad: idAplicacionSeguridad, idModuloSeguridad: idModuloSeguridad }, "[documento].[SEL_MODULO_SP]");
       
    }

   // ************ Servicios POST ************

    /**
     * @summary Procesa el path fisico del docuemento, guarda los metadatos el documento. 
     * @param file  metadatos del documento.
     * @param body  { idUsuario, idAplicacion, idModulo, descripcion, titulo }
     * @param pathFisico  
     * @param pathFinalToDb  
     * @param body  json { idUsuario, idAplicacion, idModulo, descripcion, titulo }
     * @returns {  }
     *  
     */
    postUploadFiles(file:any, pathFisico: string, body: any, pathFinalToDb: string): Promise<any>{
        return new Promise((resolve, reject) => {
            const ext = PATH.extname(file.originalname);
            let titulo = body.titulo ? body.titulo + ext : file.originalname;

            let fileEncriptName =  Md5.init(Date.now() + file.originalname) + ext;
            /**
             * Movemos el documento de su almacenamiento temporal y guardamos los metadatos con los demás datos.
             */
            fs.writeFile(pathFisico + '/' + fileEncriptName, file.buffer, {}, (err: any) => {
                if (!err) {
                    resolve({ error: [], excepcion: [], recordsets: [{
                        path: pathFinalToDb + "/" + fileEncriptName,
                        nombreOriginal: file.originalname,
                        nombre: fileEncriptName,
                        idUsuario: body.idUsuario,
                        idAplicacion: body.idAplicacionSeguridad,
                        idModulo: body.idModulo,
                        titulo: titulo,
                        size: file.size,
                        tipo: file.mimetype,
                        descripcion: body.descripcion
                    }] });
                    
                } else {
                    reject({ error: ['No se pudo guardar el documento'], excepcion: err, datasets: [] });
                }
            });
        });
    }

    /**
     * @summary Guarda los metadatos a la base de datos
     * @param arrayJsonMetadatos  Array[JSON] que se parsea a xml para enviar al sp.
     * @returns {  }
     *  
     */
    insertMetada(arrayJsonMetadatos:any[]){
        try {
            
            let documentosSend: Array<any> = [];

            arrayJsonMetadatos.forEach((doc:any) => {
                documentosSend.push({ documento: doc });
            });
            
            var xml = jsonxml({ documentos: documentosSend });
            
            return this.query.spExecute({documentos: xml}, '[documento].[INS_DOCUMENTO_SP]');
        } catch (error) {
            return new Promise((resolve, reject) => {
                reject({ excepcion: error });
            })
        }
    }

    // ************ Servicios PUT ************

    // ************ Servicios DELETE ************

    // ************ Metodos Privados ************
}
