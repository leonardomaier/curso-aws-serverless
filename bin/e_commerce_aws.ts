#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: '314598053128',
  region: 'us-east-1'
}

const tags: { [key: string]: string } = {
  cost: "ECommerce",
  team: "Epic Empanadas"
}

const productsAppLayersStack = new ProductsAppLayersStack(app, "ProductsAppLayersStack", {
  tags,
  env
})

const productsAppStack = new ProductsAppStack(app, "ProductsApp", { 
  tags, 
  env 
})

productsAppStack.addDependency(productsAppLayersStack)

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags,
  env
})

eCommerceApiStack.addDependency(productsAppStack)
