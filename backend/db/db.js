import 'dotenv/config'
import pg from 'pg'


const pool = new pg.Pool({connectionString: process.env.DATABASE_URL})

pool.on("on",() => {
    console.log("Connected to database")
})

pool.on("error",()=>{
    console.error("Database error",error)
})

export default pool