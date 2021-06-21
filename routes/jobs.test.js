"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Job = require("../models/job.js")
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u1TokenAdmin
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/* **************************************************** POST */

describe("POST /jobs", function () {
    const newjob = {
        "title" : "new job",
        "salary" : 2000,
        "equity" : 0,
        "companyHandle" : "c1"
    };
  
    test("ok for admins", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newjob)
          .set("authorization", `Bearer ${u1TokenAdmin}`);
      expect(resp.statusCode).toEqual(200);
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            "title" : 2
          })
          .set("authorization", `Bearer ${u1TokenAdmin}`);
      expect(resp.statusCode).toEqual(400);
    });
  });

/* **************************************************** GET */

describe("Get job/jobs", () => {
    test("Get jobs", async () => {
        const filters = {
            "title" : "title one"
        }

        const resp = await request(app)
        .get("/jobs")
        .send(filters)
        .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
    })
    test("Get one job", async () => {
        const jobData = await Job.getAll();
        const jobId = jobData[0].id;

        const resp = await request(app)
        .get(`/jobs/${jobId}`)
        .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
    })
})

/* **************************************************** GET */

describe("Update", () => {
    const data = {
        title : "updated job",
        salary : 30000
    }
    test("update a job", async () => {
        const jobData = await Job.getAll();
        const jobId = jobData[0].id;

        const resp = await request(app)
        .patch(`/jobs/${jobId}`)
        .send(data)
        .set("authorization", `Bearer ${u1TokenAdmin}`);

        expect(resp.statusCode).toEqual(200);
    })
    test("update a job with non existent job id", async () => {
        const resp = await request(app)
        .patch(`/jobs/${4}`)
        .send(data)
        .set("authorization", `Bearer ${u1TokenAdmin}`);

        expect(resp.statusCode).toEqual(404);
    })
})

describe("Delete", () => {
    test("delete job", async () => {
        const jobData = await Job.getAll();
        const jobId = jobData[0].id;

        const resp = await request(app)
        .delete(`/jobs/${jobId}`)
        .set("authorization", `Bearer ${u1TokenAdmin}`)

        expect(resp.statusCode).toEqual(204);
    })
    test("delete job with bad id", async () => {
        const resp = await request(app)
        .delete(`/jobs/${344}`)
        .set("authorization", `Bearer ${u1TokenAdmin}`)

        expect(resp.statusCode).toEqual(404);
    })
})