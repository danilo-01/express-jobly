const { BadRequestError } = require("../expressError");
const db = require("../db");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// Updates the passed in object to be ready to use for an sql query
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // Checks for values in the dataToUpdate object
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) => 
      // Uses the jsToSql object passed in to check if some of the variables on the
      // dataToUpdate object need to be changed so they can be read on the sql query
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // Sets up the query collums to select and puts the values for each collumn
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

// Creates a WHERE statement string
const createWhere = (whereData, jsToSql) => {
  if(!whereData) return "";
  const keys = Object.keys(whereData);
  // if there arent any values to filter with then the function returns an empty string
  if (keys.length === 0) return '';

  const cols = keys.map((colName, idx) => {
    // Adds text to WHERE string
    if(!(jsToSql[colName])) throw new BadRequestError();
      if(idx === keys.length - 1){
        return `${jsToSql[colName].sqlString} ${jsToSql[colName].operator} $${idx + 1}`;
      }
      return `${jsToSql[colName].sqlString} ${jsToSql[colName].operator} $${idx + 1} AND `;
    })

  return {
    whereSelector: `WHERE (${cols.join("")})`,
    values: Object.values(whereData),
  };
}
// Checks to see if a value in a table exists
const checkIfExists = async (table, selector, value) => {
  if(!value) return false;
// Query String
  const query = `SELECT * FROM ${table} WHERE ${selector} = $1`;
  const result = await db.query(query, [value]);
  if(result.rows.length === 0) return false;
  return true
} 



module.exports = { 
  sqlForPartialUpdate,
  createWhere,
  checkIfExists };
