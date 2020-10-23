import { Request } from 'express';
import * as sql from 'mssql';
import { Inject } from 'typedi';
import {
    JsonController,
    UploadedFile,
    Body,
    Get,
    Post,
    Req,
   
} from 'routing-controllers';
import { ExcepcionRepository } from '../repository/excepcion.repository';
import * as mail from '../helpers/mail.helpler';

/**
 * @summary En este archivo van todos los metodos referentes a los almacenes en el sistema de inventarios
 * localhost:{{port}}/almacen/...
 */

@JsonController('/excepcion')
export class ExcepcionController {
    private repository: ExcepcionRepository;

    constructor(repository: ExcepcionRepository) {
        this.repository = repository;
    }

    // ************ Servicios GET ************
    

    // ************ Servicios POST ************
    @Post('/postInsExcepcion')
    postServicio(@Body() body: Request) {
        return this.repository.postInsExcepcion(body);
    }
    
    // ************ Servicios PUT ************

    // ************ Servicios DELETE ************
    
}