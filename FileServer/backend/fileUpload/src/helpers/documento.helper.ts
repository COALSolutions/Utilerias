import { IBodyUploadFiles } from "../interfaces/documento.interface";
import { default as config } from '../config';
import { default as extens } from './extensiones';
import * as PATH from 'path';

export const documentoHelper = {
    validateParamsUploadFile: (body: IBodyUploadFiles) => {
        if(body.idAplicacionSeguridad && body.idModuloSeguridad && body.idUsuario && body.path && body.files.length > 0){
            return { isValid: true, error: null }
        } else{
            let error  =  (body.files.length == 0) ? 'El parametro files es obligatorio y debe tener al menos un documento.'    
                        :  !body.idAplicacionSeguridad ? 'idAplicacionSeguridad obligatorio.'
                        : !body.idModuloSeguridad ? 'idModuloSeguridad obligatorio.'
                        : !body.idUsuario ? 'idUsuario  obligatorio'
                        : !body.path ? 'path obligatorio': 'Faltan los parametros obligatios'
           
            return {isValid: false, error: error }
        }
    },

    getPathFisico: () => {
        /**
         * Obtenemos la configuracion dependiendo del entorno en la que trabajamos, dentro de este json de configuracion tenemos el path fisico para aguardar los documentos. 
         */
        const env: string = process.env.NODE_ENV || 'development';
        const conf = (config as any)[env];
        
        return conf.pathFisico;

    },

    getUrlThisServer: () =>{
        const env: string = process.env.NODE_ENV || 'development';
        const conf = (config as any)[env];

        return conf.protocolo + '://' + conf.host + ':' + conf.port;
    },

    validatePath: (path:string, pathConfig:string) => {
        let salida:any = [];
        let filterMiPath = path.split("\\").filter((element) => {
            return element != '';
        });

        let filterPathToDB = pathConfig.split("\\").filter((element) => {
            return element != '' && element != 'F';
        });

        if(filterMiPath.length == filterPathToDB.length){
            salida.push({valida: true, len:filterPathToDB.length})
        } else {
            salida.push({valida: false})
        };
        return salida;

    },

    validateExtension: (filename:string) => {
        const extensiones: any = extens;
        let response: boolean = false;
        for (const key in extensiones) {
            if (extensiones.hasOwnProperty(key)) {
                const element = extensiones[key];
                const ext = PATH.extname(filename).toLowerCase();

                if (element == ext) {
                    response = true;
                    break;
                }
                
            }
        }

        return response;
    },

    validateSize: (size:number) => {
        return size <= ((1024 * 1024) * 30);
    }
}