import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from 'aws-sdk'
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

  if (event.resource === '/products') {
    console.log('POST');

    const product = JSON.parse(event.body!) as Product
    
    const createdProduct = await productRepository.create(product)

    return { statusCode: 201, body: JSON.stringify(createdProduct)}
  }

  if (event.resource === '/products/{id}' && method === 'PUT') {
    const productId = event.pathParameters!.id as string

    try {
      const product = JSON.parse(event.body!) as Product
      
      const updatedProduct = await productRepository.update(productId, product)

      return { statusCode: 200, body: JSON.stringify(updatedProduct)}
    } catch (ConditionalCheckFailedException) {
      return { 
        statusCode: 404,
        body: 'Product not found'
      }
    }    
  }

  if (event.resource === '/products/{id}' && method === 'DELETE') {
    const productId = event.pathParameters!.id as string

    try {
      const product = await productRepository.delete(productId)

      return { statusCode: 200, body: JSON.stringify(product)}
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