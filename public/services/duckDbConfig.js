import * as duckdb from '@duckdb/duckdb-wasm';

let db;
let conn = null;
let instance = null;

export async function initDuckDB() {
  if (instance) {
    return instance;
  }

  try {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      })
    );

    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);

    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    conn = await db.connect();

    URL.revokeObjectURL(worker_url);
    console.log("DuckDB-Wasm initialized successfully.");
    
    instance = { db, conn };
    return instance;
  } catch (error) {
    console.error("Error initializing DuckDB-Wasm:", error);
    throw error;
  }
}
