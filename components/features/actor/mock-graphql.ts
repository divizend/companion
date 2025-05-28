import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';

import { PerformanceResponse } from '@/types/actor-api.types';

type Context = {
  performance?: PerformanceResponse;
};

const schema = makeExecutableSchema({
  typeDefs: `#graphql
    type Query {
      performance: Performance
    }

    type Performance {
      totalAmount: Float
      entries: [Entry]
    }

    type Entry {
      amount: Float
      currency: String
      quantity: Float
      quote: Float
    }
  `,
  resolvers: {
    Query: {
      performance: (_, __, context: Context) => {
        return context.performance;
      },
    },
  },
});

export const mockGraphql = {
  async getQuery<T extends any>(queryText: string, variables: any = {}, context: Context = {}) {
    const result = await graphql({
      schema,
      source: queryText,
      variableValues: variables,
      contextValue: context,
    });

    if (result.errors) {
      throw result.errors[0]; // Optional: improve error handling
    }

    return result as { data: T; errors?: any[] };
  },
};
