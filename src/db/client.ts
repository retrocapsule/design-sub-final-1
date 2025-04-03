// This is a placeholder database client
// In a production environment, you would configure your actual database connection here

// Temporary mock database client for development
const mockClient = {
  payment: {
    findUnique: async () => ({ 
      id: 'mock-payment-id',
      status: 'succeeded',
      amount: 1000,
      currency: 'usd',
      description: 'Mock payment',
      createdAt: new Date(),
      user: {
        id: 'mock-user-id',
        name: 'John Doe',
        email: 'john@example.com'
      }
    }),
    findMany: async () => ([
      {
        id: 'mock-payment-id-1',
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        description: 'Mock payment 1',
        createdAt: new Date(),
        user: {
          id: 'mock-user-id-1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      {
        id: 'mock-payment-id-2',
        status: 'pending',
        amount: 2000,
        currency: 'usd',
        description: 'Mock payment 2',
        createdAt: new Date(),
        user: {
          id: 'mock-user-id-2',
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      }
    ]),
    create: async () => ({
      id: 'new-mock-payment-id',
      status: 'succeeded',
      amount: 1000,
      currency: 'usd',
      description: 'New mock payment',
      createdAt: new Date()
    }),
    update: async () => ({
      id: 'mock-payment-id',
      status: 'refunded',
      amount: 1000,
      currency: 'usd',
      description: 'Mock payment',
      refundedAmount: 1000,
      createdAt: new Date()
    })
  },
  user: {
    findUnique: async () => ({
      id: 'mock-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER'
    }),
    findMany: async () => ([
      {
        id: 'mock-user-id-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER'
      },
      {
        id: 'mock-user-id-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'USER'
      }
    ]),
    update: async () => ({
      id: 'mock-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
      credits: 1000
    })
  }
};

export const prisma = mockClient; 