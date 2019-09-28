let resources = require('./resources')
let discovery = require('./discovery')
let security = require('./security')

/**
 * add the upload bucket and a lambda for thumbnailing
 */
module.exports = function upload(arc, cfn) {
  let visit = (template, method)=> method(arc, template)
  return [resources, discovery, security].reduce(visit, cfn)
}
