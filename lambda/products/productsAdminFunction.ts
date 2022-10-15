import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const method = event.httpMethod

  const lambdaRequestId = context.awsRequestId
  const apiRequestId = event.requestContext.requestId

  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

  if (event.resource === '/products') {
    console.log('POST');
    return { statusCode: 201, body: JSON.stringify({ message: 'POST Products - OK' })}
  }

  if (event.resource === '/products/{id}' && event.httpMethod === 'PUT') {
    const { id } = event.pathParameters!

    return { statusCode: 200, body: JSON.stringify({ message: `Put product with ${id} - OK` })}
  }

  if (event.resource === '/products/{id}' && event.httpMethod === 'DELETE') {
    const { id } = event.pathParameters!

    return { statusCode: 200, body: JSON.stringify({ message: `Delete product with ${id} - OK` })}
  }

  return { statusCode: 400, body: JSON.stringify({ message: "Bad request" }) }
}