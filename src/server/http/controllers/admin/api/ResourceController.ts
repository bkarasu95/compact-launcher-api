import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import HttpException from "../../../../exceptions/api/http-exception";
import { toURLConverter } from "../../../../helpers/route";
import ModelService from "../../../../services/ModelService.service";

abstract class ResourceController {
    protected abstract service: ModelService; // use the service layer for db proccesses. don't access db directly

    /**
     * 
     * @param req ExressJS Request object
     * @param res ExressJS Response object
     * @param next ExressJS Next function
     */
    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let limitParam: string = typeof req.query.limit != "undefined" ? req.query.limit.toString() : "";
            let offsetParam: string = typeof req.query.start != "undefined" ? req.query.start.toString() : "";
            let where: object = typeof req.query.where != "undefined" ? this.whereStringToObject(req.query.where.toString()) : {};
            let fields: object = typeof req.query.fields != "undefined" ? {} : {};

            let count = await this.service.count(where); // total data count, useful for pagination 
            let limit: number | null = Number.parseInt(limitParam);
            let offset: number | null = Number.parseInt(offsetParam);
            const data = await this.service.findAll(where, fields, limit, offset);
            res.setMessage("Records Fetched").customResponse({ items: data, total: count });
        } catch (e) {
            next(e); // if you take an error, pass the function and go to middleware
        }
    };

    /**
     * 
     * @param req ExressJS Request object
     * @param res ExressJS Response object
     * @param next ExressJS Next function
     */
    show = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item = await this.service.find({ _id: req.params.id });
            if (item.length === 0) {
                throw new HttpException(400, "Record Not Found");
            }
            res.setMessage("Record Fetched").customResponse(item);
        } catch (e) {
            next(e); // if you take an error, pass the function and go to middleware
        }
    };

    /**
     * 
     * @param req ExressJS Request object
     * @param res ExressJS Response object
     * @param next ExressJS Next function
     */
    insert = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validationError = validationResult(req);
            if (!validationError.isEmpty()) {
                const validation = validationError.mapped();
                const firstValidationMessage = validation[Object.keys(validation)[0]].msg;
                throw new HttpException(422, "Validation Failed: " + firstValidationMessage + " in " + validation[Object.keys(validation)[0]].param, {
                    validation: validation,
                });
            }
            req.body.slug = req.body.slug ? toURLConverter(req.body.slug) : toURLConverter(req.body.name); // TODO check this with different model that slug doesnt exists.
            let model = req.body;
            if (typeof req.files != "undefined") {
                model.images = this.processImages(req);
                if (model.images.length === 0) {
                    delete model.images;
                }
            }
            await this.service.insert(model);
            res.setMessage("Record Added").customResponse(model);
        } catch (e) {
            next(e);
        }
    };

    /**
     * 
     * @param req ExressJS Request object
     * @param res ExressJS Response object
     * @param next ExressJS Next function
     */
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validationError = validationResult(req);
            if (!validationError.isEmpty()) {
                throw new HttpException(422, "Validation Failed", {
                    validation: validationError.mapped(),
                });
            }
            const model: Document = req.body;
            // TODO make compatible
            // model.images = this.processImages(req);
            await this.service.update(req.params.id, model);
            res.setMessage("Record Updated").customResponse(model);
        } catch (e) {
            next(e);
        }
    };

    /**
     * 
     * @param req ExressJS Request object
     * @param res ExressJS Response object
     * @param next ExressJS Next function
     */
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!this.service.delete(req.params.id)) {
                throw new HttpException(400, "Record Couldn't Deleted");
            }
            res.setMessage("Record Deleted").customResponse();
        } catch (e) {
            next(e);
        }
    };
    /**
     * TODO make a structure that can impelemetable
     * @param method 
     */
    abstract validate(method: string): Array<any>;
    /**
     * TODO make a structure that can impelemetable
     * @param request 
     */
    abstract processImages(request: Request): Array<any>;

    // TODO think about add afterUpdate, afterSave, beforeUpdate, beforeSave


    /**
     * convert the "where" param in url query to compatible for mongoose where query
     * @param where 
     */
    private whereStringToObject(where: string): object {
        let whereObject = {};
        let whereFields = where.split(','); // split the query by ',' 
        if (whereFields.length > 1) {
            for (let key in whereFields) {
                const field = whereFields[key];
                // TODO add the > , < etc. operators  
                let condition = field.split('=');
                whereObject[condition[0]] = condition[1];
            }
        } else {
            // TODO add the > , < etc. operators
            let condition = where.split('='); // left side would field, right side would value
            whereObject[condition[0]] = condition[1];
        }
        return whereObject;
    }
}


export default ResourceController;