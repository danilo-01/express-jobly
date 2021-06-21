"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, createWhere, checkIfExists } = require("../helpers/sql");

// Class for updating the jobs table in database

class Job {
    /**Adds a job to database
     * an object with job title, salary, equity 
     * and the companies handle 
     * must be provided
     *  returns job {id, title, salary, equity, company_handle}
     */
    static async create({ title, salary, equity, companyHandle }){
        if(!(await checkIfExists('companies', 'handle', companyHandle))) throw new BadRequestError(`No company with handle ${companyHandle}`);
        const result = await db.query(`
            INSERT INTO jobs 
            (title, salary, equity, company_handle) 
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [title, salary, equity, companyHandle]);
        
        const job = result.rows[0];
        return job;
    }
    /* 
    Gets a job by id in database
    
    Required : id

    pass in an object that has an id

    {
        "id" : 1
    }

    returns 
    {
        "id" : 1,
        "title": "Job title",
        "salary" : 1000,
        "equity" : 0,
        "companyHandle" : company handle
    }
    */
    static async get(id){

        const result = await db.query(`
            SELECT * FROM jobs 
            WHERE id = $1`,
            [id]);
    
        if(result.rows.length === 0) throw new NotFoundError();
        return result.rows[0]
    }
/* 
    Gets all jobs in database

    Required : None

    filters => {
        minSalary : 1000,
        hasEquity : true,
        title : "job title"
    }
    
    returns 
    [{
        "id" : 1,
        "title": "Job title",
        "salary" : 1000,
        "equity" : 0,
        "companyHandle" : company handle
    } {...}]
  */
    static async getAll(filters){
        let whereSelector = '';
        let values = [];

        // If there are filters they get turned into a where selector string
        if(filters){
            if(Object.keys(filters).length){

            let op;
                if(filters.hasEquity != undefined){
                    if(filters.hasEquity){
                        filters.hasEquity = 0
                        op = '>'
                    }else{
                        filters.hasEquity = 0
                        op = '='
                    }
                }
              // This tells the whereQuery function how to write the query
                const whereQuery = createWhere(filters, {
                minSalary : { sqlString : "salary",
                                 operator : ">"},
                title : { sqlString : "title",
                                 operator : "LIKE"},
                hasEquity : { sqlString : "equity",
                                 operator : `${op}`}
              })
              whereSelector = whereQuery.whereSelector;
              values = whereQuery.values;
            }
          }

        const result = await db.query(`
            SELECT id, title, salary, equity, company_handle
            FROM jobs
            ${whereSelector}
            ORDER BY title`,
             [...values]);

        return result.rows;
    }
/*    
    Updates a job with an id and data
    Required : updateData, object with id
    
    updateData => {
        "title" : "new title",
        "salary" : 2000,
        "equity" : 0
    }

    id => {
        "id" : 1
    }

    returns 
    {
        "id" : 1,
        "title": "Job title",
        "salary" : 1000,
        "equity" : 0,
        "companyHandle" : company handle
    }
 */
    static async update(updateData, id){
        const {setCols, values} = await sqlForPartialUpdate(updateData, {});

        const idIndex = values.length + 1;
        const sqlQuery = `
            UPDATE jobs SET ${setCols} 
            WHERE id = $${idIndex} 
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`
        const result = await db.query(sqlQuery, [...values, id]);

        return result.rows[0];
    }
/* 
    Delete a job in database
    
    Required : id

    id => 1

    Returns 
    {
        "status" : DELETED
    }
*/
    static async delete(id){
        const sqlQuery = `
            DELETE FROM jobs WHERE id = $1 
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;

        const result = await db.query(sqlQuery, [id]);
        
        return result.rows[0];
    }
}

module.exports = Job;