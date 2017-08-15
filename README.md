
# cfn-lex-bot



## Purpose

AWS CloudFormation does not support Amazon Lex / AWS Lex. This is a Lambda-backed custom resource to add support for [AWS Lex Bots](http://docs.aws.amazon.com/lex/latest/dg/API_BotMetadata.html) to CloudFormation.

[This package on NPM](https://www.npmjs.com/package/cfn-lex-bot)  
[This package on GitHub](https://www.github.com/andrew-templeton/cfn-lex-bot)


## Implementation

This Lambda makes use of the Lambda-Backed CloudFormation Custom Resource flow module, `cfn-lambda` ([GitHub](https://github.com/andrew-templeton/cfn-lambda) / [NPM](https://www.npmjs.com/package/cfn-lambda)).


## Installation

This package uses `cfn-lambda` ([GitHub](https://github.com/andrew-templeton/cfn-lambda) / [NPM](https://www.npmjs.com/package/cfn-lambda)) Launcher Pages, so you can install this in your AWS Account without downloading anything! Just visit my (the maintainer) Launch Page and click Launch on the `us-east-1` region. It only supports installation in the `us-east-1` region right now, since that's the only AWS region Amazon Lex is supported in right now.

[Maintainer's Launcher Page](https://s3.amazonaws.com/cfn-lex-bot-006297545748-us-east-1/1-0-3.html)

After using this Launch Page, your CloudFormation templates will have access to `Custom::LexBot` resources as long as you add `ServiceToken` to the `Properties` for the resource and use it like in the example template. The `ServiceToken` is available to you in the `Outputs` of the CloudFormation Stack the Launch Page link creates.

Furthermore, you can simply `Fn::ImportValue` the installed `ServiceToken` Lambda ARN using:

      "Fn::ImportValue": "cfn-lex-bot-1-0-3-ServiceToken"


If you clone this repo and run `npm run deploy`, it will do the same thing / install the same way that clicking on the Launch link will.

You can then deploy the example template included in this module: [Example Template for Custom::LexBot](https://github.com/andrew-templeton/example.template.json).

After you do, verify the slot exists in the [Amazon Lex Console Bot view](https://console.aws.amazon.com/lex/home?region=us-east-1#bots:)!


## Usage

  See [`./example.template.json`](./example.template.json) for a sample CloudFormation template. The example uses `Parameters` and dynamic `ServiceToken` ingestion using `Fn::ImportValue` fully.

  The `Properties` exactly follow the API endpoint parameter structure the nodejs SDK uses. The method can be found in [the AWS docs here](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/LexModelBuildingService.html#putBot-property)


#### Miscellaneous

##### Collaboration & Requests

Submit pull requests or tweet [@ayetempleton](https://twitter.com/ayetempleton) if you want to get involved with roadmap as well, or if you want to do this for a living :)


##### License

[MIT](./License)


##### Want More CloudFormation?

Work is (extremely) active, published here:  
[Andrew's NPM Account](https://www.npmjs.com/~andrew-templeton)
