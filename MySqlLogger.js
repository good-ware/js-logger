const Defaults = require('./Defaults');
const TaskLogger = require('./TaskLogger');
const GeneratorLogger = require('./GeneratorLogger');

/**
 * @description Logs the start and completion or error of a MySql database command
 * @hideconstructor
 */
class MySqlLogger {
  /**
   * @description Creates two log entries for a Connection.query() execution: 'begin' and either 'end' or 'error.' See
   * TaskLogger.execute for more information. The sql and params arguments are logged.
   * @param {Object} logger
   * @param {Connection} connection mysql2 Connection object
   * @param {String} sql SQL statement to execute
   * @param {*} params SQL statement placeholder arguments
   * @param {Object} options Additional options to send to connection.query()
   * @return {Promise} Returns the return value of connection.query(sql, params, ...options)
   */
  static query(logger, connection, sql, params, options) {
    const summary = ` ${sql}`.replace(/\s+/g, ' ').substr(0, Defaults.maxMessageLength);
    return TaskLogger.execute(
      logger.child('mysql'),
      () => connection.query({ sql, params, ...options }),
      { sql, params, message: `SQL Begin:${summary}` },
      `SQL End:${summary}`,
      `SQL:${summary}`
    );
  }

  /**
   * @description Creates a 'begin' log entry. The SQL statement and params are logged. Returns the value returned by
   * the older mysql package's (instead of the mysql2 package) connection.query method for stream-based data access.
   * @param {Object} logger
   * @param {Object} connection A mysql2 Connection object
   * @param {String} sql A SQL statement to execute
   * @param {*} params Placeholder arguments for the sql statement
   * @param {Object} options Additional options to send to connection.query
   * @return {Object} Returns an object with two properties:
   * emitter: The return value of conection.connection.query(). It has on() methods.
   * logger: The return value of GeneratorLogger.begin() with the following additional properties:
   * 1. {String} sql
   * 2. {*[]} params
   * 3. {String} summary: A summarized version of the sql argument
   * See GeneratorLogger.begin() for more information.
   */
  static emitQuery(logger, connection, sql, params, options) {
    const summary = ` ${sql}`.replace(/\s+/g, ' ').substr(0, Defaults.maxMessageLength);
    const emitter = connection.connection.query({ sql, params, ...options });
    const logObj = GeneratorLogger.begin(
      logger.child('mysql'),
      { sql, params, message: `SQL Begin:${summary}` },
      `SQL End:${summary}`,
      `SQL:${summary}`
    );
    Object.assign(logObj, { sql, params, summary });
    return { emitter, logger: logObj };
  }
}

module.exports = MySqlLogger;
