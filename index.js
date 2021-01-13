
var AWS = require('aws-sdk')
var CfnLambda = require('cfn-lambda')

var LexModelBuildingService = new AWS.LexModelBuildingService({
  apiVersion: '2017-04-19'
})


// CloudFormation sends everything as a String, have to coerce these values.
const boolProperties = [
  'childDirected',
  'detectSentiment'
]

// CloudFormation sends everything as a String, have to coerce these values.
const numProperties = [
  'clarificationPrompt.maxAttempts',
  'idleSessionTTLInSeconds'
]


// Simple PUT operation. The returned attributes are only important ones for
//   other resources to know about.
// We use the name as the PhysicalResourceId because a name change requires
//   REPLACEMENT in Amazon Lex, and thus a changed PhysicalResourceId achieves
//   this effect in our CloudFormation system.
const Upsert = CfnLambda.SDKAlias({
  api: LexModelBuildingService,
  forceNums: numProperties,
  forceBools: boolProperties,
  method: 'putBot',
  returnPhysicalId: 'name',
  returnAttrs: [
    'version',
    'checksum'
  ]
})


// A little more complex. It's a wrapped SDKAlias.
// If there's a name change, run a CREATE, and it'll clean the old one,
//   because a new PhysicalResourceId will be returned (the new name).
// If there's no change, but a checksum is passed to the template to ensure
//   consistency for some reason, also just use params for checksum.
// If no name change, and no checksum passed, then we need to just update
//   seamlessly. This requires knowing the checksum of the current version.
//   To get that, we run the getBotAttrs just like in the NoUpdate, then pass
//   checksum acquired into the update call to the SDKAlias before running.
const Update = function (RequestPhysicalID, CfnRequestParams, OldCfnRequestParams, reply) {
  const sameName = CfnRequestParams.name === OldCfnRequestParams.name
  function go () {
    Upsert(RequestPhysicalID, CfnRequestParams, OldCfnRequestParams, reply)
  }
  if (CfnRequestParams.checksum || !sameName) {
    console.log('Name change or checksum provided, do not need to look up.')
    return go()
  }
  console.log('Name is same and no checksum provided, must acquire to update.')
  getBotAttrs(OldCfnRequestParams, function (err, attrs) {
    if (err) {
      return reply(err)
    }
    console.log('Checksum value: %s', attrs.checksum)
    CfnRequestParams.checksum = attrs.checksum
    go()
  })
}

// Delete can simply be run with the name passed in.
// Ignore 404's if it's already gone.
// 409's sometimes thrown if it's a recent deletion.
const Delete = CfnLambda.SDKAlias({
  api: LexModelBuildingService,
  method: 'deleteBot',
  keys: ['name'],
  ignoreErrorCodes: [404, 409]
})

// When there's an explicit DependsOn resource altered, but no change on this
//   specific resource, we still have to return the checksum and version attrs.
const NoUpdate = function (PhysicalResourceId, CfnResourceProperties, reply) {
  console.log('Noop update must drive "version" and "checksum" attributes.')
  getBotAttrs(CfnResourceProperties, function (err, attrs) {
    if (err) {
      return next(err)
    }
    console.log('Replying w/ PhysicalResourceId %s and Attributes: %j', attrs)
    reply(null, PhysicalResourceId, attrs)
  })
}

exports.handler = CfnLambda({
  Create: Upsert,
  Update: Update,
  Delete: Delete,
  NoUpdate: NoUpdate
})

// Because of checksum requirements for Update and NoUpdate, we need to be able
//   to pull the checksum of version, to drive (1) passing to Amazon Lex on
//   putBot calls where the named Bot already exists, or (2) to pass
//   params for Fn::GetAtt to use when a no-change UPDATE is passed due to
//   explicit DependsOn propagations in a template.
function getBotAttrs (props, next) {
  const latestVersion = '$LATEST'
  const BotParams = {
    name: props.name,
    version: latestVersion
  }
  console.log('Accessing current slot version with getBot: %j', BotParams)
  LexModelBuildingService.getBot(BotParams, function (err, BotData) {
    if (err) {
      console.error('Problem accessing data during read to Bot: %j', err)
      return next(err.code + ': ' + err.message)
    }
    console.log('Got Bot information back: %j', BotData)
    const BotReplyAttrs = {
      checksum: BotData.checksum,
      version: latestVersion
    }
    console.log('Bot attributes: %j', BotReplyAttrs)
    next(null, BotReplyAttrs)
  })
}
