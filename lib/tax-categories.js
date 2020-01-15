import { client, taxService } from './services'
const nconf = require('nconf')

const deleteTaxCategories = (cb) => {
  const request = {
    uri: taxService
      .build(),
    method: 'GET'
  }
  client.process(
    request,
    (payload) => {
      const results = payload.body.results
      return Promise.all(
        results.map((element) => {
          return client.execute({
            uri: taxService
              .byId(element.id)
              .withVersion(element.version)
              .build(),
            method: 'DELETE'
          })
        })
      )
    }
  ).then(() => {
    console.log('\x1b[32m%s\x1b[0m', 'All tax categories are succesfully deleted')
    if (cb) {
      return cb()
    }
  })
    .catch(err => console.log(err))
}

const importTaxCategories = () => {
  var taxCategories = require(process.cwd() + '/data/tax-category.json')
  taxCategories.forEach(element => {
    const updateRequest = {
      uri: taxService.build(),
      method: 'POST',
      body: element
    }

    client.execute(updateRequest)
      .catch(error => console.log(error.body.errors))
  })
}

if (nconf.get('clean')) {
  deleteTaxCategories()
} else if (nconf.get('import')) {
  console.log('\x1b[32m%s\x1b[0m', 'Importing tax categories...')
  importTaxCategories()
}

module.exports = {
  deleteTaxCategories
}