var jsreport = require('jsreport')({wkhtmltopdf:{allowLocalFilesAccess:true}});

jsreport.init(function () {
  // running
}).catch(function (e) {
  // error during startup
  console.error(e.stack)
  process.exit(1)
})
