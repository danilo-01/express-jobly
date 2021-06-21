"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
    const newJob = {
      title: 'new title',
      salary: 1000,
      equity: 0,
      companyHandle: 'c1'
    };
  
    test("works", async function () {

      let job = await Job.create(newJob);
      expect(job).toEqual({
        id : job.id,
        title: 'new title',
        salary: 1000,
        equity: '0',
        companyHandle: 'c1'
      });
  
      const result = await db.query(
            `SELECT  id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE title = 'new title'`);
             
      expect(result.rows).toEqual([
        {
            id : result.rows[0].id,
            title: 'new title',
            salary: 1000,
            equity: '0',
            companyHandle: 'c1'
        }
      ]);
    });
  });

describe("find", () => {
    test("Find all", async () => {
        const result = await Job.getAll();
        expect(result.length).toEqual(3);
    })
    test("Find with filter", async () => {
        const result = await Job.getAll({minSalary: 1001});
        expect(result.length).toEqual(2);
    })
})

describe("Update", () => {
    test("Update job", async () => {
      const jobData = await Job.getAll({"title" : "title one"})
      const id = jobData[0].id;

      const data = {
        title : "updatedtitle",
        salary : 3000
      }
      const result = await Job.update(data, id);
      expect(result.title).toEqual('updatedtitle');
    })

    test("Update job with bad values", async () => {
      const data = {
        title : "updatedtitle",
        salary : 3000
      }
      const result = await Job.update(data, 322);
      expect(result).toEqual(undefined);
    })
})

describe("Delete tests", () => {
  test("Delete a job", async () => {
    const jobData = await Job.getAll({"title" : "title one"})
    const id = jobData[0].id;

    const result = await Job.delete(id);

    expect(result).toEqual({"companyHandle": "c1",
    "equity": "0", "id": id, "salary": 1000,
    "title": "title one"});
  })

  test("Delete a job  with bad data", async () => {
    const result = await Job.delete(3);
    expect(result).toEqual(undefined);
  })
})