// Part Four: Jobs

"use strict";

const db = require("../db");
const {
    BadRequestError,
    NotFoundError,
    ExpressError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class job {
    // create a job
    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title,
            salary,
            equity,
            company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
            [data.title, data.salary, data.equity, data.companyHandle]
        );
        let job = result.rows[0];

        return job;
    }

    //find job with all, filter
    static async findAll({ title, minSalary, hasEquity } = {}) {
        let query = `SELECT j.id,
         j.title,
         j.salary,
         j.equity,
         j.company_handle AS "companyHandle",
         c.name AS "companyName" FROM jobs j LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let where = [];
        let searchValues = [];
        if (title !== undefined) {
            searchValues.push(`%${title}%`);
            where.push(`title ILIKE $${queryValues.length}`);
        }

        if (minSalary !== undefined) {
            searchValues.push(minSalary);
            where.push(`salary >= $${searchValues.length}`);
        }
        if (hasEquity === true) {
            where.push(`equity > 0`);
        }
        if (where.length > 0) {
            query += " WHERE " + where.join(" AND ");
        }

        query += " ORDER BY title";
        const jobRes = await db.query(query, searchValues);
        return jobRes.rows;
    }
    // search a job with a given id
    static async get(id) {

        const jobRes = await db.query(
            `SELECT id,
          title,
          salary,
          equity,
          company_handle FROM jobs WHERE id = $1`,
            [id]
        );

        const job = jobRes.rows[0];

        if (!job) {throw new NotFoundError(`No job: ${id}`);}

        return job;
    }

}
  //   update a job
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${handleVarIdx}
                      RETURNING id, title, salary, equity, company_handle `;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) {throw new NotFoundError(`No job: ${id}`);}

    return job;
}

  // remove a job
  static async remove(id) {
    const result = await db.query(
        `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]
    );
    const job = result.rows[0];

    if (!job) {throw new NotFoundError(`No job: ${id}`);}
}

module.exports = job;


