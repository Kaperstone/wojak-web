const fs = require("fs")
const t = require("handlebars")

export default async function (req, res) {
    const path = req.url.split("?").shift()
    
    // 404
    let filePath = "public/404.js"

    try {
        switch(path) {
            // My circle
            case "": filePath = "home.js";break
            case "/": filePath = "home.js"; break
            case "/dashboard": filePath = "info.js"; break
            case "/stake": filePath = "stake.js"; break
            case "/bonds": filePath = "bonds.js"; break
            case "/farms": filePath = "farms.js"; break
            case "/loans": filePath = "loans.js"; break
            case "/launchpad": filePath = "launchpad.js"; break
            case "/swap": filePath = "swap.js"; break
            case "/admin": filePath = "admin.js"; break
            case "/portfolio": filePath = "portfolio.js"; break
            case "/rebase": filePath = "rebase.js"; break
            case "/soyfarms": filePath = "soyfarms.js"; break
            case "/bridge": filePath = "bridge.js"; break
        }

        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, PATCH, DELETE, POST, PUT")

        return res.status(200).end(
            t.compile(fs.readFileSync("public/index.html").toString())({
                filePath
            }).toString())
    } catch (err) {
        return res.status(404).json({
            error: "404 Not Found",
            filePath,
            err
        })
    }
}

/*

    Combine index with bundle.js
    Packages  

*/