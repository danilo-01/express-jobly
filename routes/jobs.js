"use string";

/** Routes For Jobs */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobsGetSchema = require("../schemas/jobsGet.json");
const db = require("../db");

const router = new express.Router();
/* Create a new job and associate it with a company

POST /jobs

Required : title, salary, equity, companyHandle
{
"title" : "title of job",
"salary" : 2000,
"equity" : 0,
"companyHandle" : "company handle"
}  

Returns {job : {"id", "title", "equity", "salary", "companyHandle"}}
*/

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }

      const job = await Job.create(req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
});
/* 
Get all jobs or filter for jobs

GET /jobs

Required : None
{
    "minSalary" : 2000,
    "title" : "title to look for",
    "hasEquity" : true
}
Returns {jobs : {"id", "title", "equity", "salary", "companyHandle"} ...}
*/

router.get("/", async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobsGetSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }

        const jobs = await Job.getAll(req.body)
        return res.send(200).json({jobs});
    }catch(e){
        return next(e);
    }
});

/* 
Get job by id

GET /jobs/:id

Required : None
{

}
Returns {job : {"id", "title", "equity", "salary", "companyHandle"}}
*/
router.get("/:id", async(req, res, next) => {
    try{
        const job = await Job.get(req.params.id)
        return res.send(200).json({job});
    }catch(e){
        return next(e);
    }
});

/* 
UPDATE job by id

UPDATE /jobs/:id

Required : None
{
    "title" : "new title",
    "salary" : 2000,
    "equity" : 0
}
Returns {job : {"id", "title", "equity", "salary", "companyHandle"}}
 */
router.patch("/:id", ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }

        const job = await Job.update(req.body, req.params.id);
        if(!job) throw new NotFoundError(`No job: ${req.params.id}`);

        return res.json({ job });
    }catch(e){
        return next(e);
    };
})

/* 
DELETE job by id

UPDATE /jobs/:id

Required : None
{

}
Returns {job : {"id", "title", "equity", "salary", "companyHandle"}}
 */
router.delete("/:id", ensureAdmin, async (req, res, next) => {
    try{
        const deleted = await Job.delete(req.params.id);
        if(!deleted) throw new NotFoundError(`No job: ${req.params.id}`)
        return res.status(204).json({status : "DELETED"});
    }catch(e){
        next(e);
    }
})

module.exports = router;