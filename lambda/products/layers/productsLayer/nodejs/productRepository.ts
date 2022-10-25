import { v4 as uuid } from 'uuid'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

export interface Product {
  id: string,
  productName: string,
  code: string,
  price: number,
  model: string
}

export class ProductRepository {
  private dbClient: DocumentClient
  private productsDb: string

  constructor(dbClient: DocumentClient, productsDb: string) {
    this.dbClient = dbClient
    this.productsDb = productsDb
  }

  async getAllProducts(): Promise<Product[]> {
    
    const data = await this.dbClient
      .scan({ TableName: this.productsDb })
      .promise();


    return data.Items as Product[]
  }

  async getProductById(productId: string): Promise<Product> {

    const data = await this.dbClient.get({ 
      TableName: this.productsDb,
      Key: {
        id: productId
      }
    }).promise()

    if (!data.Item) {
      throw new Error('Product does not exist')     
    }

    return data.Item as Product
  }

  async create(product: Product): Promise<Product> {

    product.id = uuid()

    await this.dbClient.put({
      TableName: this.productsDb,
      Item: product
    }).promise()

    return product
  }

  async delete(productId: string): Promise<Product> {
    
    const data = await this.dbClient.delete({
      TableName: this.productsDb,
      Key: {
        id: productId
      },
      ReturnValues: "ALL_OLD"
    }).promise()

    if (!data.Attributes) {
      throw new Error("Product does not exist")
    }

    return data.Attributes as Product
  }

  async update(productId: string, product: Product): Promise<Product> {

    const data = await this.dbClient.update({
      TableName: this.productsDb,
      Key: {
        id: productId
      },
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'UPDATE_NEW',
      UpdateExpression: "set productName = :n, code = :c, price = :p, model = :m",
      ExpressionAttributeValues: {
        ":n": product.productName,
        ":c": product.code,
        ":p": product.price,
        ":m": product.model
      }
    }).promise()

    data.Attributes!.id = productId

    return data.Attributes as Product
  }
}