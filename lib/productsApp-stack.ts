import { Construct } from 'constructs'

import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class ProductsAppStack extends cdk.Stack {

  readonly productsFetchHandler: lambdaNode.NodejsFunction

  readonly productsAdminHandler: lambdaNode.NodejsFunction

  readonly productsDb: dynamodb.Table

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    this.productsDb = new dynamodb.Table(this, "ProductsDb", {
      tableName: "Products",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1
    })

    const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsLayerVersionArn')

    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductsLayerVersionArn', productsLayerArn)

    this.productsFetchHandler = new lambdaNode.NodejsFunction(this, 'ProductsFetchFunction', {
      functionName: 'ProductsFetchFunction',
      entry: "lambda/products/productsFetchFunction.ts",
      handler: "handler",
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false
      },
      environment: {
        PRODUCTS_DB: this.productsDb.tableName
      },
      layers: [productsLayer]
    })

    this.productsDb.grantReadData(this.productsFetchHandler)

    this.productsAdminHandler = new lambdaNode.NodejsFunction(this, 'ProductsAdminFunction', {
      functionName: 'ProductsAdminFunction',
      entry: "lambda/products/productsAdminFunction.ts",
      handler: "handler",
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false
      },
      environment: {
        PRODUCTS_DB: this.productsDb.tableName
      },
      layers: [productsLayer]
    })

    this.productsDb.grantReadWriteData(this.productsAdminHandler)
  }
}