import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as cwlogs from 'aws-cdk-lib/aws-logs'

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNode.NodejsFunction,
  productsAdminHandler: lambdaNode.NodejsFunction,
}

export class ECommerceApiStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props)

    const logGroup = new cwlogs.LogGroup(this, "ECommerceApiLogs")

    const api = new apigateway.RestApi(this, "ECommerceApi", {
      restApiName: "ECommerceApi",
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true
        })
      }
    })

    const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler)
    
    const productsResource = api.root.addResource("products")
    productsResource.addMethod("GET", productsFetchIntegration)

    const productIdResource = productsResource.addResource("{id}")
    productIdResource.addMethod("GET", productsFetchIntegration)

    const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler)

    productsResource.addMethod("POST", productsAdminIntegration)

    productIdResource.addMethod("PUT", productsAdminIntegration)

    productIdResource.addMethod("DELETE", productsAdminIntegration)
  }
}

