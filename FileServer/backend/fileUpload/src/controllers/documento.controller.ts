import { Request } from 'express';
import {
    JsonController,
    UploadedFiles,
    Body,
    Get,
    Post,
    Req,
    QueryParam,
    Res
} from 'routing-controllers';
import { documentoHelper } from '../helpers/documento.helper';
import { DocumentoRepository } from '../repository/documento.repository';
import { IBodyUploadFiles } from '../interfaces/documento.interface';
import * as fs from 'fs-extra';
import * as xml2json from 'xml-js';

/**
 * @summary En este archivo van todos los metodos referentes a los documentos
 * localhost:{{port}}/documento/...
 */

@JsonController('/documento')
export class DocumentoController {
    private repository: DocumentoRepository;

    constructor(repository: DocumentoRepository) {
        this.repository = repository;
    }

    @Get('/GetDocumentoById')
    // #region
    /*
    Nombre:         GetDocumentoById
    Autor:          Andres Farias Bautista
    Fecha:          02/18/2019
    Descripción:    Busca los datos de un documento por medio de su idDocumento
    SP:             [documento].[SEL_DOCUMENTO_BYID_SP]
    Url:            http://localhost:4050/documento/GetDocumentoById?idDocumento=278
    body:           NA
    */
    // #endregion
    async getDocumentoById(@Req() req: Request) {
        if (req.query.idDocumento) {
            let response = await this.repository.getDocumentoById(req.query);
            response = this.concatRecordSetsUrlServer(response);
            return response;
        } else {
            return { error: 'idDocumento obligatorio', excepcion: '', recordsets: [] }
        }
    }

    @Post('/GetDocumentosById')
    // #region
    /*
    Nombre:         GetDocumentosById
    Autor:          Andres Farias Bautista
    Fecha:          02/18/2019
    Descripción:    Busca los datos los documentos recibidos desde un array, el array es de objetos json que contienen idDocumento a buscar.
    SP:             [documento].[SEL_DOCUMENTOS_BYID_SP]
    Url:            http://localhost:4050/documento/GetDocumentosById?documentos=[{ "idDocumento": 281},{ "idDocumento": 280 }]
    body:           NA
    */
    // #endregion
    async GetDocumentosById(@Body() body: Request) {

        if (body) {

            let response = await this.repository.getDocumentosById(body);
            response = this.concatRecordSetsUrlServer(response);
            return response;
        } else {
            return { error: 'documentos obligatorio', excepcion: '', recordsets: [] }
        }
    }

    // ************ Servicios POST ************

    @Post('/UploadFiles')
    // #region
    /*
    Nombre:         UploadFiles
    Autor:          Andres Farias Bautista
    Fecha:          02/18/2019
    Descripción:    Guarda documentos en el file server, recibe un array de documentos para guarda en el SO y en la DB
    SP:             [documento].[INS_DOCUMENTO_SP]
    Url:            http://localhost:4050/documento/UploadFiles
    body:           {
                        files: [Object]
                        idUsuario: 1,
                        idAplicacionSeguridad: 1,
                        idModuloSeguridad: 1,
                        path: '2',
                        titulo: 'unidad',
                        descripcion: 'Foto de la unidad'
                    }
    */
    // #endregion
    async postUploadFiles(@Req() req: any,@UploadedFiles('files') files: any[], @Body({ required: true }) body: IBodyUploadFiles, @Res() res: any) {
        /** Buscamos el modulo ligado a idAplicacionSeguridad y el idModuloSeguridad para obtener el idModulo y la estructura el path.  */
        let pathFisico = '';
        body.files = req.files;

        /**Se valida los paramatros */
        const validate:any = documentoHelper.validateParamsUploadFile(body);
        if(!validate.isValid)
            return { error: validate.error, excepcion: '', recordsets: [] }

        return this.repository.getModuloByAplicacionModulo(body.idAplicacionSeguridad, body.idModuloSeguridad)
            .then(async (resultModulo: any) => {
                let datoModulo: any;
                
                if (resultModulo.recordsets[0].length > 0) {
                    datoModulo = resultModulo.recordsets[0]
                    datoModulo = datoModulo[0];
                    body.idModulo = datoModulo.idModulo
                    const pathValid:any = documentoHelper.validatePath(body.path, datoModulo.estructuraPath);
                    
                    /**
                     * Path que se guardará en la DB
                     */
                    let pathFinalToDb = '';

                    if (pathValid[0].valida) {
                        /**
                         * Obtener el path fisico en donde se guardarán los documentos.
                         */
                        if (pathValid[0].len >= 1) {
                            const lenNombre = datoModulo.nombre.split("-");
                            pathFisico += documentoHelper.getPathFisico() + '/' + lenNombre[0] + '/' + body.path;
                            pathFinalToDb = '/' + lenNombre[0] + '/' + body.path
                        } else{
                            pathFisico += documentoHelper.getPathFisico() + '/' + datoModulo.nombre + '/' + body.path;
                            pathFinalToDb = '/' + datoModulo.nombre + '/' + body.path
                        }
                        
                        
                        /**  Recorremos el array de documentos para guardarlos en el pathfisco */
                        let finalArray = req.files.map(async (file: any) => {

                            /**Se valida el tipo de documento */
                            const extensionValid = documentoHelper.validateExtension(file.originalname);

                            if (extensionValid) {
                                /** Se valida el tamaño del documento */
                                const sizeValid = documentoHelper.validateSize(file.size);
                                if (sizeValid) {
                                    return new Promise((resolve, reject) => {
                                        /** Se valida si el path existe, de lo contrario se crea para guardar el documento. */
                                        fs.pathExists(pathFisico).then((exists: any) => {
                                            if (exists) {
                                                this.repository.postUploadFiles(file, pathFisico, body, pathFinalToDb).then((resultSaved) => {
                                                    /** Regresa los metadatos del documento */
                                                    resolve(resultSaved);
                                                }).catch((errorSaved) => {
                                                    reject(errorSaved);
                                                });
                                            } else {
                                                /** Se crea el directorio */
                                                fs.ensureDir(pathFisico)
                                                    .then(() => {
                                                        this.repository.postUploadFiles(file, pathFisico, body, pathFinalToDb).then((resultSaved) => {
                                                            resolve(resultSaved);
                                                        }).catch((errorSaved) => {
                                                            reject(errorSaved);
                                                        });
                                                    })
                                                    .catch(err => {
                                                        reject({ error: ['Error al intentar crear el path fisico.'], excepcion: err, recordsets: [] });
                                                    })
                                            }
                                        }).catch((error: any) => {
                                            reject({ error: ['Error en el path'], excepcion: error, recordsets: [] });
                                        });
                                    }).then(data => data).catch(error => error);
                                } else {
                                    return new Promise((resolve) => {
                                        resolve({ error: 'El tamaño del documento excede el limite permitido.', nombre: file.originalname,  recordsets: [] })
                                    }).then(data => data);
                                }
                            } else {
                                return new Promise((resolve) => {
                                    resolve({ error: 'No se acepta el tipo de archivo.', nombre: file.originalname, recordsets: [] })
                                }).then(data => data);
                            }

                        });

                        /**
                         * Obtiene el resultado de guardadar en el SO y validar cada documento, recibe un array de los resultados obtenidos
                         */
                        const recordsFinal = await Promise.all(finalArray);
                        
                        if (Array.isArray(recordsFinal)) {
                            //Para guardar los metadatos de los documentos a la DB.
                            let arrayJsonMetadatos: any[] = [];
                            /** Guardamos cada documento a un array para mandarle al metodo  insertMetada*/
                            recordsFinal.forEach((documento: any) => {
                                if (documento.error.length == 0 && documento.recordsets.length > 0) {
                                    arrayJsonMetadatos.push(documento.recordsets[0]);
                                }
                            });

                            if (arrayJsonMetadatos.length > 0) {
                                
                                /**
                                 *  insertMetada guarda los metadatos a la base de datos y regresa un array de estos documentos con su idDocumento,
                                 * se hace validacion en caso de ser un documento xml se agrega una propiedad xml al resultado final
                                 * con el con contenido del xml en formato JSON.
                                 **/
                                return this.repository.insertMetada(arrayJsonMetadatos).then((result: any) => {
                                    let salida:any[] = [];
                                    let cont = 0;
                                    let length = result.recordsets[0].length;
                                    /**En caso de que se guarde correctamente, damos formato a la salida, concatenamos el path con la url del servidor */
                                    return new Promise((resolveMetadata) => {
                                        result.recordsets[0].forEach((doc:any) => {
                                            doc.path = documentoHelper.getUrlThisServer() + doc.path;
                                            // si es un xml entonces regresamos el contenido del xml en formato json
                                            if (doc.tipo === 'text/xml') {
                                                /**
                                                 * Leemos el documentos xml y lo parseamos a json para el resultado final de los metadatos
                                                 */
                                                fs.readFile(pathFisico + '/' + doc.nombre, (err, data: any) => {
                                                    cont++;
                                                    const json = JSON.parse(xml2json.xml2json(data, {compact: true, spaces: 4}));
                                                    doc.xml = json
                                                    salida.push(doc);
                                                    if (cont == length) {
                                                        resolveMetadata();
                                                    }
                                                });
                                            } else {
                                                cont++;
                                                salida.push(doc);
                                                if (cont == length){
                                                    resolveMetadata();
                                                }
                                            }
                                            
                                        });
                                    }).then(() => {
                                        let documentosError = recordsFinal.filter((doc:any) => {
                                            if(doc.error && doc.recordsets.length == 0){
                                                return doc.error
                                            };
                                        });
                                        /**
                                         * Resultado final de la peticion con el formato de salida de las peticiones
                                         */
                                        return { error: documentosError, excepcion: [], recordsets: salida };
                                    });
                                    
                                }).catch((error: any) => {
                                    let cont = 0;
                                    let length = arrayJsonMetadatos.length;
                                    /** En caso de que falle, eliminamos cada documentos del pathFisico */
                                    return new Promise((resolve) => {
                                        arrayJsonMetadatos.forEach((documento) => {
                                            fs.remove(pathFisico + "/" + documento.nombre, () => {
                                                cont++;
                                                if (cont == length) {
                                                    resolve({ error: ['Error al intentar guardar los metadatos a la base de datos.'], excepcion: error.excepcion, recordsets: [] });
                                                }
                                            })
                                        });
                                    }).then(result => result);
                                });
                            }else {
                                let documentosError = recordsFinal.filter((doc:any) => {
                                    if(doc.error && doc.recordsets.length == 0){
                                        return doc.error
                                    };
                                });

                                return { error: documentosError, excepcion: [], recordsets: [] };
                            }
                        } else {
                            return { error: [], excepcion: [], recordsets: [] };
                        }

                    } else {
                        return { error: 'Path incorrecto.', excepcion: [], recordsets: [] }
                    }
                } else {
                    return { error: 'El modulo no existe.', excepcion: [], recordsets: resultModulo }
                }
            }).catch((error: any) => {
                return { error: 'Error al intentar buscar el modulo.', excepcion: error, recordsets: [] };
            })

    }

    // ************ Servicios PUT ************

    // ************ Servicios DELETE ************

    // *********** metodos internos ***********
    concatRecordSetsUrlServer(response: any): any {
        if (response.recordsets.length > 0) {
            if (Array.isArray(response.recordsets[0])) {
                let record = response.recordsets[0]
                response.recordsets = [];
                if (record.length > 1) {
                    response.recordsets = record;
                } else {
                    response.recordsets.push(record[0]);
                }
            }
            if (response.recordsets.length > 0) {
                response.recordsets.forEach((documento: any, index: number) => {
                    if (response.recordsets[index])
                        response.recordsets[index].path = documentoHelper.getUrlThisServer() + documento.path;
                    else
                        response.recordsets = [];
                });
            }

            return response;
        }

        return response;
    }
}