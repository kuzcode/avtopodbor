import { Client, Databases, Query } from 'appwrite';

export const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('68f8c951000b0fd91105');

export const databases = new Databases(client);

export const DATABASE_ID = '68f8c9600006416432d0';
export const COLLECTION_ID = 'transport';

export { Query };


