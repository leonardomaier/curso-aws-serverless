import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk"
import * as AWSXRay from 'aws-xray-sdk'

AWSXRay.captureAWS(require("aws-sdk"))

const productsDb = process.env.PRODUCTS_DB!
const dbClient = new DynamoDB.DocumentClient()

const productRepository = new ProductRepository(dbClient, productsDb)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const method = event.httpMethod

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId

  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

  if (event.resource === '/products' && method === 'GET') {
    console.log('GET');

    const products = await productRepository.getAllProducts();

    return { statusCode: 200, body: JSON.stringify(products)}
  }

  if (event.resource === '/products/{id}' && method === 'GET') {

    const productId = event.pathParameters!.id as string;

    try {
      const product = await productRepository.getProductById(productId);
      
      return {
        statusCode: 200,
        body: JSON.stringify(product)
      }
    } catch (error) {
      console.error((<Error>error).message)
      return {
        statusCode: 404,
        body: (<Error>error).message
      }
    }
  }

  return { statusCode: 400, body: JSON.stringify({ message: "Bad request" }) }
}