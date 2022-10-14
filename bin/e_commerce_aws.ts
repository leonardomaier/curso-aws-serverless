#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: '314598053128',
  region: 'us-east-1'
}

const tags: { [key: string]: string } = {
  cost: "ECommerce",
  team: "Epic Empanadas"
}

const productsAppStack = new ProductsAppStack(app, "ProductsApp", { 
  tags, 
  env 
})

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  tags,
  env
})

eCommerceApiStack.addDependency(productsAppStack)
