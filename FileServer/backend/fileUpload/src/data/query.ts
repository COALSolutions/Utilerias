import * as sql from 'mssql';
import { default as confDB } from '../data/config';
import * as Q from 'q';


/**
 * @summary En este archivo van todos los metodos referentes a la conoxción con las bases de datos
 * 
 */
export class Query {
    constructor() {}
    public spExecute(params: any, SP: string){
        return this.dbConnect((dbConn: any, deferred: Q.Deferred<{}>) => {
            var request = new sql.Request(dbConn);

            const KEYS$ = Object.keys(params);
            for (const KEY$ of KEYS$) {
                request.input(`${KEY$}`, params[KEY$]);
            }
            let errSQL = '';
            request.output("err",sql.VarChar(500),errSQL)
            request.execute(SP).then((recordsets: sql.IProcedureResult<any>) => {
                
                    var msj = {
                        error : errSQL,
                        excepcion : '',
                        recordsets : recordsets.recordsets
                    }
                    dbConn.close();
                    deferred.resolve(msj);
                }).catch((err) => {
                    
                    var msj = {
                        error : errSQL,
                        excepcion : err,
                        recordsets : null
                    }
                    dbConn.close();
                    deferred.reject(msj);
                });
        });
    }
   
    private dbConnect(callback: Function): Q.IPromise<{}> {
        const env: string = process.env.NODE_ENV || 'development';
        var deferred = Q.defer();
        try {
            var dbConn = new sql.ConnectionPool((confDB as any)[env]);
            dbConn.connect()
                .then(() => callback(dbConn, deferred))
                .catch(deferred.reject);
    
            } catch (error) {
                console.log('error de conexion');
                
                deferred.reject
            }
            return deferred.promise;
    }
}
